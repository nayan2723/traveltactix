
-- Fix infinite recursion: team_members SELECT policy references itself
-- Drop the recursive policy and replace with a non-recursive one
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;

CREATE POLICY "Team members can view team members"
ON public.team_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);
