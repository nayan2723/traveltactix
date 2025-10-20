-- Allow service role to insert missions (for edge function)
-- The generate-missions edge function needs to be able to create missions

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON missions;

-- Recreate the SELECT policy
CREATE POLICY "Missions are viewable by everyone"
  ON missions
  FOR SELECT
  USING (true);

-- Add INSERT policy for service role (edge functions use service role)
CREATE POLICY "Service role can insert missions"
  ON missions
  FOR INSERT
  WITH CHECK (true);