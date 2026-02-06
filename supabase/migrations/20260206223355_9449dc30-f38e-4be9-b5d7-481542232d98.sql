-- Add additional SELECT policies to profiles for legitimate use cases

-- Allow viewing profiles of accepted friends
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;
CREATE POLICY "Users can view friends profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT friend_id FROM public.friendships 
    WHERE user_id = auth.uid() AND status = 'accepted'
    UNION
    SELECT user_id FROM public.friendships 
    WHERE friend_id = auth.uid() AND status = 'accepted'
  )
);

-- Allow viewing profiles of team members
DROP POLICY IF EXISTS "Users can view team members profiles" ON public.profiles;
CREATE POLICY "Users can view team members profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT tm.user_id FROM public.team_members tm
    WHERE tm.team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  )
);

-- Allow basic profile search for friend discovery (limited fields enforced by query)
DROP POLICY IF EXISTS "Users can search for profiles" ON public.profiles;
CREATE POLICY "Users can search for profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Note: The previous "Users can view own profile" policy still exists and handles owner access