-- Fix security definer view by dropping and recreating without security definer
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.total_xp,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.total_xp DESC, p.created_at ASC) as rank
FROM public.profiles p
ORDER BY p.total_xp DESC
LIMIT 100;

-- XP calculation and level up function
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Level formula: sqrt(XP / 100)
  RETURN GREATEST(1, FLOOR(SQRT(xp::numeric / 100)));
END;
$$;

-- Auto-update level when XP changes
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.level = calculate_level_from_xp(NEW.total_xp);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update level on XP change
DROP TRIGGER IF EXISTS update_level_on_xp_change ON public.profiles;
CREATE TRIGGER update_level_on_xp_change
  BEFORE UPDATE OF total_xp ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Also update level on insert
DROP TRIGGER IF EXISTS update_level_on_insert ON public.profiles;
CREATE TRIGGER update_level_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();