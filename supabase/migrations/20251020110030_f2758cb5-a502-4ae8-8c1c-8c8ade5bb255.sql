-- Update existing missions with proper location coordinates for testing
-- Eiffel Tower, Paris
UPDATE missions 
SET latitude = 48.8584, longitude = 2.2945 
WHERE city = 'Paris' AND title = 'Cultural Ambassador';

-- Gateway of India, Mumbai  
UPDATE missions 
SET latitude = 18.9220, longitude = 72.8347
WHERE city = 'Mumbai' AND title IN ('Street Food Master', 'Local Connection');

-- Tokyo Tower, Tokyo
UPDATE missions
SET latitude = 35.6586, longitude = 139.7454
WHERE city = 'Tokyo' AND title = 'Hidden Gem Finder';

-- City Palace, Jaipur
UPDATE missions
SET latitude = 26.9258, longitude = 75.8237
WHERE city = 'Jaipur' AND title = 'Temple Explorer';

-- Insert a few more test missions with known landmarks for easier testing
INSERT INTO missions (title, description, category, difficulty, city, country, latitude, longitude, xp_reward, is_active)
VALUES 
  ('Statue of Liberty Visit', 'Take a photo at the Statue of Liberty', 'landmark', 'Easy', 'New York', 'USA', 40.6892, -74.0445, 150, true),
  ('Big Ben Check-in', 'Check in near Big Ben clock tower', 'landmark', 'Easy', 'London', 'UK', 51.5007, -0.1246, 100, true),
  ('Sydney Opera House', 'Visit the iconic Sydney Opera House', 'cultural', 'Medium', 'Sydney', 'Australia', -33.8568, 151.2153, 200, true),
  ('Taj Mahal Explorer', 'Experience the beauty of Taj Mahal', 'cultural', 'Hard', 'Agra', 'India', 27.1751, 78.0421, 300, true);

-- Add trigger function to award badges automatically when users complete missions
CREATE OR REPLACE FUNCTION check_and_award_mission_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  completed_count INTEGER;
  badge_id_to_award UUID;
BEGIN
  -- Only proceed if mission was just completed
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    
    -- Count total completed missions for this user
    SELECT COUNT(*) INTO completed_count
    FROM user_missions
    WHERE user_id = NEW.user_id AND is_completed = true;

    -- Award "First Steps" badge for first mission
    IF completed_count = 1 THEN
      SELECT id INTO badge_id_to_award FROM badges WHERE name = 'First Steps';
      IF badge_id_to_award IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_id_to_award)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;

    -- Award more badges based on mission counts
    IF completed_count >= 5 THEN
      SELECT id INTO badge_id_to_award FROM badges WHERE name = 'Hidden Gem Finder';
      IF badge_id_to_award IS NOT NULL THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_id_to_award)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;

  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic badge awards
DROP TRIGGER IF EXISTS award_mission_badges ON user_missions;
CREATE TRIGGER award_mission_badges
  AFTER UPDATE ON user_missions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_mission_badges();