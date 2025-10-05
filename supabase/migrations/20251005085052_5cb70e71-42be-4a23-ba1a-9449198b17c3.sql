-- Add DELETE policies for user privacy and data management

-- Allow users to delete their own visit history
CREATE POLICY "Users can delete their own place visits"
ON public.user_place_visits
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own search history
CREATE POLICY "Users can delete their own search history"
ON public.user_search_history
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own cultural progress
CREATE POLICY "Users can delete their own cultural progress"
ON public.user_cultural_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own mission progress
CREATE POLICY "Users can delete their own mission progress"
ON public.user_missions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own badges (if they want to reset)
CREATE POLICY "Users can delete their own badges"
ON public.user_badges
FOR DELETE
USING (auth.uid() = user_id);

-- Update profile visibility to require authentication
-- Drop the current public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy for authenticated users only
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');