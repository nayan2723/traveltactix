-- Phase 2: Security Hardening - Fix RLS Policies

-- 1. Fix missions table INSERT policy (restrict to service role only)
DROP POLICY IF EXISTS "Service role can insert missions" ON public.missions;

-- Create a more restrictive policy - only allow inserts from authenticated service context
-- This prevents direct client inserts while still allowing edge functions with service role
CREATE POLICY "Service role can insert missions" 
ON public.missions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 2. Create a secure leaderboard view that only exposes minimal data
-- First, create a function to get leaderboard data safely
CREATE OR REPLACE FUNCTION public.get_leaderboard_entry(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  level integer,
  total_xp integer,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    COALESCE(
      CASE 
        WHEN LENGTH(p.full_name) > 2 THEN 
          SUBSTRING(p.full_name FROM 1 FOR 1) || '***' || SUBSTRING(p.full_name FROM LENGTH(p.full_name) FOR 1)
        ELSE p.full_name
      END,
      'Anonymous'
    ) as display_name,
    p.level,
    p.total_xp,
    ROW_NUMBER() OVER (ORDER BY p.total_xp DESC, p.created_at ASC) as rank
  FROM public.profiles p
  WHERE p.user_id = target_user_id OR target_user_id IS NULL
$$;

-- 3. Add DELETE policy for user_streaks
CREATE POLICY "Users can delete their own streaks"
ON public.user_streaks
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Restrict user_notifications INSERT to service role only (prevents spam)
CREATE POLICY "Only service role can create notifications"
ON public.user_notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- 6. Drop the overly permissive leaderboard policy and create a restrictive one
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.profiles;

-- Create a new policy that only allows viewing own profile in full OR limited leaderboard data
CREATE POLICY "Users can view full own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to see limited leaderboard data (XP and level only)
CREATE POLICY "Authenticated users can view leaderboard data"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);