-- ============================================
-- PHASE 1: SECURITY HARDENING (Corrected Syntax)
-- ============================================

-- 1.1 Create secure profiles_public view with anonymized data
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    level,
    total_xp,
    CASE 
      WHEN LENGTH(COALESCE(full_name, '')) > 2 THEN 
        SUBSTRING(full_name FROM 1 FOR 1) || '***' || SUBSTRING(full_name FROM LENGTH(full_name) FOR 1)
      ELSE 'Anonymous'
    END as display_name,
    avatar_url,
    created_at
  FROM public.profiles;

-- Drop ALL existing SELECT policies on profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for leaderboard" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create restrictive policy: users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 1.2 Add write denial policies to content tables
-- Places table
DROP POLICY IF EXISTS "Anyone can view places" ON public.places;
DROP POLICY IF EXISTS "Places are viewable by everyone" ON public.places;
DROP POLICY IF EXISTS "Places are publicly readable" ON public.places;
DROP POLICY IF EXISTS "No client writes on places" ON public.places;
DROP POLICY IF EXISTS "No client updates on places" ON public.places;
DROP POLICY IF EXISTS "No client deletes on places" ON public.places;

CREATE POLICY "Places are publicly readable"
ON public.places FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on places"
ON public.places FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on places"
ON public.places FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on places"
ON public.places FOR DELETE TO authenticated USING (false);

-- Missions table
DROP POLICY IF EXISTS "Anyone can view missions" ON public.missions;
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;
DROP POLICY IF EXISTS "Missions are publicly readable" ON public.missions;
DROP POLICY IF EXISTS "No client writes on missions" ON public.missions;
DROP POLICY IF EXISTS "No client updates on missions" ON public.missions;
DROP POLICY IF EXISTS "No client deletes on missions" ON public.missions;

CREATE POLICY "Missions are publicly readable"
ON public.missions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on missions"
ON public.missions FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on missions"
ON public.missions FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on missions"
ON public.missions FOR DELETE TO authenticated USING (false);

-- Badges table
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
DROP POLICY IF EXISTS "Badges are publicly readable" ON public.badges;
DROP POLICY IF EXISTS "No client writes on badges" ON public.badges;
DROP POLICY IF EXISTS "No client updates on badges" ON public.badges;
DROP POLICY IF EXISTS "No client deletes on badges" ON public.badges;

CREATE POLICY "Badges are publicly readable"
ON public.badges FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on badges"
ON public.badges FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on badges"
ON public.badges FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on badges"
ON public.badges FOR DELETE TO authenticated USING (false);

-- Cultural lessons table
DROP POLICY IF EXISTS "Anyone can view cultural lessons" ON public.cultural_lessons;
DROP POLICY IF EXISTS "Cultural lessons are viewable by everyone" ON public.cultural_lessons;
DROP POLICY IF EXISTS "Cultural lessons are publicly readable" ON public.cultural_lessons;
DROP POLICY IF EXISTS "No client writes on cultural_lessons" ON public.cultural_lessons;
DROP POLICY IF EXISTS "No client updates on cultural_lessons" ON public.cultural_lessons;
DROP POLICY IF EXISTS "No client deletes on cultural_lessons" ON public.cultural_lessons;

CREATE POLICY "Cultural lessons are publicly readable"
ON public.cultural_lessons FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on cultural_lessons"
ON public.cultural_lessons FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on cultural_lessons"
ON public.cultural_lessons FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on cultural_lessons"
ON public.cultural_lessons FOR DELETE TO authenticated USING (false);

-- Cultural content table
DROP POLICY IF EXISTS "Anyone can view cultural content" ON public.cultural_content;
DROP POLICY IF EXISTS "Cultural content is viewable by everyone" ON public.cultural_content;
DROP POLICY IF EXISTS "Cultural content is publicly readable" ON public.cultural_content;
DROP POLICY IF EXISTS "No client writes on cultural_content" ON public.cultural_content;
DROP POLICY IF EXISTS "No client updates on cultural_content" ON public.cultural_content;
DROP POLICY IF EXISTS "No client deletes on cultural_content" ON public.cultural_content;

CREATE POLICY "Cultural content is publicly readable"
ON public.cultural_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on cultural_content"
ON public.cultural_content FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on cultural_content"
ON public.cultural_content FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on cultural_content"
ON public.cultural_content FOR DELETE TO authenticated USING (false);

-- AR hotspots table
DROP POLICY IF EXISTS "Anyone can view ar hotspots" ON public.ar_hotspots;
DROP POLICY IF EXISTS "AR hotspots are viewable by everyone" ON public.ar_hotspots;
DROP POLICY IF EXISTS "AR hotspots are publicly readable" ON public.ar_hotspots;
DROP POLICY IF EXISTS "No client writes on ar_hotspots" ON public.ar_hotspots;
DROP POLICY IF EXISTS "No client updates on ar_hotspots" ON public.ar_hotspots;
DROP POLICY IF EXISTS "No client deletes on ar_hotspots" ON public.ar_hotspots;

CREATE POLICY "AR hotspots are publicly readable"
ON public.ar_hotspots FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "No client writes on ar_hotspots"
ON public.ar_hotspots FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No client updates on ar_hotspots"
ON public.ar_hotspots FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No client deletes on ar_hotspots"
ON public.ar_hotspots FOR DELETE TO authenticated USING (false);

-- 1.3 Fix friendship status manipulation
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Receiver can accept or reject friend request" ON public.friendships;
DROP POLICY IF EXISTS "Sender can cancel pending request" ON public.friendships;

CREATE POLICY "Receiver can accept or reject friend request"
ON public.friendships FOR UPDATE TO authenticated
USING (auth.uid() = friend_id AND status = 'pending')
WITH CHECK (auth.uid() = friend_id AND status IN ('accepted', 'rejected'));

CREATE POLICY "Sender can cancel pending request"
ON public.friendships FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- 1.6 Create data retention cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_place_visits 
  WHERE visited_at < now() - interval '2 years';
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_old_visits() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_old_visits() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_old_visits() FROM authenticated;