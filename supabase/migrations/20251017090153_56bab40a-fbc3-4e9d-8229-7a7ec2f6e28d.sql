-- Fix search path for award_cultural_badges function
CREATE OR REPLACE FUNCTION public.award_cultural_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_lessons_count INTEGER;
  user_states_count INTEGER;
  user_language_lessons INTEGER;
  badge_record RECORD;
BEGIN
  -- Count total lessons completed
  SELECT COUNT(DISTINCT lesson_id) INTO user_lessons_count
  FROM user_cultural_progress
  WHERE user_id = NEW.user_id AND progress_type = 'lesson';

  -- Count unique states completed
  SELECT COUNT(DISTINCT cl.city) INTO user_states_count
  FROM user_cultural_progress ucp
  JOIN cultural_lessons cl ON ucp.lesson_id = cl.id
  WHERE ucp.user_id = NEW.user_id AND ucp.progress_type = 'lesson';

  -- Count language lessons
  SELECT COUNT(DISTINCT lesson_id) INTO user_language_lessons
  FROM user_cultural_progress
  WHERE user_id = NEW.user_id 
  AND progress_type = 'lesson'
  AND completion_data->>'language_practiced' = 'true';

  -- Check and award badges based on criteria
  FOR badge_record IN 
    SELECT id, criteria FROM badges WHERE badge_type = 'cultural'
  LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = NEW.user_id AND badge_id = badge_record.id
    ) THEN
      -- Award based on criteria
      IF (badge_record.criteria->>'lessons_completed')::INTEGER IS NOT NULL 
         AND user_lessons_count >= (badge_record.criteria->>'lessons_completed')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;

      IF (badge_record.criteria->>'states_completed')::INTEGER IS NOT NULL 
         AND user_states_count >= (badge_record.criteria->>'states_completed')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;

      IF (badge_record.criteria->>'language_lessons')::INTEGER IS NOT NULL 
         AND user_language_lessons >= (badge_record.criteria->>'language_lessons')::INTEGER THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Add RLS policy for leaderboard view access
CREATE POLICY "Leaderboard is viewable by everyone"
ON public.profiles FOR SELECT
USING (true);