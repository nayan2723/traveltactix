-- Add location-based data to existing tables

-- First, let's add location fields to missions table to make them location-specific
ALTER TABLE missions ADD COLUMN city TEXT;
ALTER TABLE missions ADD COLUMN country TEXT;
ALTER TABLE missions ADD COLUMN latitude NUMERIC;
ALTER TABLE missions ADD COLUMN longitude NUMERIC;
ALTER TABLE missions ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;

-- Insert sample places data for popular travel destinations
INSERT INTO places (name, description, latitude, longitude, city, country, category, is_hidden_gem, cultural_tips) VALUES
-- Mumbai, India
('Gateway of India', 'Iconic arch monument overlooking the Arabian Sea', 18.9220, 72.8347, 'Mumbai', 'India', 'historical', false, '{"tips": ["Best time to visit is early morning or sunset", "Street food vendors nearby serve authentic Mumbai snacks"]}'),
('Marine Drive', 'Famous waterfront promenade known as Queen''s Necklace', 18.9443, 72.8234, 'Mumbai', 'India', 'scenic', false, '{"tips": ["Perfect for evening walks", "Great view of sunset over Arabian Sea"]}'),
('Crawford Market', 'Historic market for spices, fruits and local goods', 18.9467, 72.8342, 'Mumbai', 'India', 'market', true, '{"tips": ["Try fresh fruit juices", "Bargain for better prices", "Best visited in morning"]}'),

-- Jaipur, India  
('Hawa Mahal', 'Palace of Winds with intricate lattice work', 26.9239, 75.8267, 'Jaipur', 'India', 'historical', false, '{"tips": ["Early morning light is best for photography", "Can only view from outside"]}'),
('City Palace', 'Royal residence with museums and courtyards', 26.9255, 75.8231, 'Jaipur', 'India', 'historical', false, '{"tips": ["Allow 2-3 hours for complete visit", "Audio guide recommended"]}'),
('Jantar Mantar', 'UNESCO World Heritage astronomical observatory', 26.9247, 75.8249, 'Jaipur', 'India', 'historical', false, '{"tips": ["Best visited with a guide to understand the instruments", "Avoid midday sun"]}'),

-- Paris, France
('Louvre Museum', 'World''s largest art museum', 48.8606, 2.3376, 'Paris', 'France', 'cultural', false, '{"tips": ["Book tickets online to skip lines", "Wednesday and Friday evenings less crowded"]}'),
('Montmartre District', 'Artistic hill crowned by Sacré-Cœur', 48.8867, 2.3431, 'Paris', 'France', 'cultural', false, '{"tips": ["Wear comfortable shoes for cobblestone streets", "Evening atmosphere is magical"]}'),
('Le Marché des Enfants Rouges', 'Oldest covered market in Paris', 48.8634, 2.3639, 'Paris', 'France', 'market', true, '{"tips": ["Try different international foods", "Lunch time gets very busy"]}'),

-- Tokyo, Japan
('Senso-ji Temple', 'Ancient Buddhist temple in Asakusa', 35.7148, 139.7967, 'Tokyo', 'Japan', 'cultural', false, '{"tips": ["Visit early morning for peaceful experience", "Don''t forget to cleanse hands and mouth"]}'),
('Shibuya Crossing', 'World''s busiest pedestrian crossing', 35.6598, 139.7006, 'Tokyo', 'Japan', 'urban', false, '{"tips": ["Best viewed from Starbucks overlooking the crossing", "Most crowded during rush hours"]}'),
('Tsukiji Outer Market', 'Fresh seafood and street food paradise', 35.6654, 139.7707, 'Tokyo', 'Japan', 'market', false, '{"tips": ["Go early for best selection", "Cash only at most stalls", "Try fresh sushi and tamagoyaki"]}');

-- Update existing missions with location data
UPDATE missions SET 
  city = CASE 
    WHEN title LIKE '%Temple%' THEN 'Jaipur'
    WHEN title LIKE '%Street Food%' THEN 'Mumbai' 
    WHEN title LIKE '%Cultural%' THEN 'Paris'
    WHEN title LIKE '%Hidden Gem%' THEN 'Tokyo'
    WHEN title LIKE '%Local Connection%' THEN 'Mumbai'
    WHEN title LIKE '%Art%' THEN 'Paris'
    WHEN title LIKE '%Market%' THEN 'Delhi'
    WHEN title LIKE '%Sunrise%' THEN 'Jaipur'
  END,
  country = CASE 
    WHEN title LIKE '%Temple%' OR title LIKE '%Street Food%' OR title LIKE '%Local Connection%' OR title LIKE '%Sunrise%' THEN 'India'
    WHEN title LIKE '%Cultural%' OR title LIKE '%Art%' THEN 'France'
    WHEN title LIKE '%Hidden Gem%' THEN 'Japan'
    WHEN title LIKE '%Market%' THEN 'India'
  END,
  deadline = now() + INTERVAL '7 days'
WHERE city IS NULL;

-- Insert more location-specific missions
INSERT INTO missions (title, description, category, difficulty, xp_reward, city, country, deadline, is_active) VALUES
('Mumbai Street Food Challenge', 'Try 3 iconic Mumbai street foods: Vada Pav, Pav Bhaji, and Bhel Puri', 'food', 'Easy', 200, 'Mumbai', 'India', now() + INTERVAL '3 days', true),
('Jaipur Royal Heritage', 'Visit Hawa Mahal and City Palace in a single day', 'cultural', 'Medium', 300, 'Jaipur', 'India', now() + INTERVAL '5 days', true),
('Paris Art Gallery Hop', 'Explore 3 different art galleries or museums in one day', 'cultural', 'Medium', 250, 'Paris', 'France', now() + INTERVAL '7 days', true),
('Tokyo Temple & Modern Mix', 'Visit a traditional temple and a modern skyscraper in the same trip', 'cultural', 'Medium', 200, 'Tokyo', 'Japan', now() + INTERVAL '4 days', true),
('Local Market Explorer', 'Spend 2 hours exploring a traditional local market', 'cultural', 'Easy', 150, 'Mumbai', 'India', now() + INTERVAL '2 days', true),
('Sunset Photography Mission', 'Capture sunset from 2 different scenic viewpoints', 'adventure', 'Medium', 180, 'Jaipur', 'India', now() + INTERVAL '6 days', true);