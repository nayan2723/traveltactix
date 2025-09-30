-- Add user favorites table for offbeat destinations
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add mood/theme tags to places table
ALTER TABLE public.places 
ADD COLUMN mood_tags TEXT[] DEFAULT '{}',
ADD COLUMN estimated_visit_time INTEGER DEFAULT 60, -- in minutes
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Create index for better filtering performance
CREATE INDEX idx_places_mood_tags ON public.places USING GIN(mood_tags);
CREATE INDEX idx_places_category ON public.places(category);
CREATE INDEX idx_places_hidden_gem ON public.places(is_hidden_gem);

-- Insert sample offbeat destinations with mood tags
INSERT INTO public.places (name, description, category, city, country, latitude, longitude, is_hidden_gem, mood_tags, estimated_visit_time, image_urls, cultural_tips) VALUES
('Secret Rooftop Garden', 'A hidden garden sanctuary atop an old building, perfect for sunset views and peaceful meditation.', 'Nature', 'Tokyo', 'Japan', 35.6762, 139.6503, true, ARRAY['Relax', 'Instagrammable', 'Spiritual'], 90, ARRAY['https://images.unsplash.com/photo-1549880338-65ddcdfd017b'], '{"tips": ["Remove shoes before entering", "Bow slightly when greeting the gardener", "Photography is encouraged but ask permission first"]}'),

('Underground Jazz Cave', 'A speakeasy-style jazz club hidden beneath a bookstore, featuring local musicians and craft cocktails.', 'Entertainment', 'New York', 'USA', 40.7589, -73.9851, true, ARRAY['Adventure', 'Foodie'], 120, ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'], '{"tips": ["Password changes weekly - ask the bartender", "Cash only establishment", "Dress code: smart casual"]}'),

('Floating Temple', 'An ancient temple that appears to float on water during high tide, accessible only by small boat.', 'Religious', 'Bali', 'Indonesia', -8.6405, 115.0894, true, ARRAY['Spiritual', 'Adventure', 'Instagrammable'], 180, ARRAY['https://images.unsplash.com/photo-1537953773345-d172ccf13cf1'], '{"tips": ["Respect silence zones", "Wear modest clothing", "Sunrise visits offer best lighting"]}'),

('Street Food Alley', 'A narrow alley packed with authentic local food vendors, hidden from tourist maps but beloved by locals.', 'Food', 'Bangkok', 'Thailand', 13.7563, 100.5018, true, ARRAY['Foodie', 'Adventure'], 60, ARRAY['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe'], '{"tips": ["Point to food you want - minimal English", "Eat where locals eat", "Always carry small bills"]}'),

('Eco Forest Lodge', 'Sustainable treehouse accommodation in pristine rainforest, perfect for digital detox and wildlife watching.', 'Accommodation', 'Costa Rica', 'Costa Rica', 9.7489, -83.7534, true, ARRAY['Eco-friendly', 'Adventure', 'Relax'], 480, ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e'], '{"tips": ["Pack biodegradable toiletries only", "Early morning best for wildlife spotting", "No WiFi - embrace the disconnect"]}'),

('Hidden Beach Cove', 'A secluded beach accessible only through a sea cave, perfect for snorkeling and solitude.', 'Beach', 'Algarve', 'Portugal', 37.0870, -8.6190, true, ARRAY['Adventure', 'Instagrammable', 'Relax'], 240, ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e'], '{"tips": ["Check tide tables before visiting", "Bring waterproof bag for belongings", "Best accessed during low tide"]}'),

('Artisan Quarter', 'A maze of workshops where local craftspeople create traditional handicrafts using centuries-old techniques.', 'Culture', 'Marrakech', 'Morocco', 31.6295, -7.9811, false, ARRAY['Spiritual', 'Foodie', 'Adventure'], 150, ARRAY['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e'], '{"tips": ["Bargaining is expected and respected", "Learn basic Arabic greetings", "Support fair trade workshops"]}'),

('Mountain Monastery', 'A centuries-old monastery perched on a cliff edge, offering meditation retreats and breathtaking valley views.', 'Religious', 'Ladakh', 'India', 34.1526, 77.5771, true, ARRAY['Spiritual', 'Adventure'], 300, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'], '{"tips": ["Acclimatize to altitude gradually", "Respect photography restrictions", "Participate in morning prayers if invited"]}');

-- Add some popular destinations for comparison
INSERT INTO public.places (name, description, category, city, country, latitude, longitude, is_hidden_gem, mood_tags, estimated_visit_time, image_urls, cultural_tips) VALUES
('Times Square', 'The bustling heart of NYC with bright lights, theaters, and endless energy.', 'Landmark', 'New York', 'USA', 40.7580, -73.9855, false, ARRAY['Adventure', 'Instagrammable'], 60, ARRAY['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'], '{"tips": ["Visit early morning for fewer crowds", "Watch for pickpockets in busy areas", "Free entertainment throughout the day"]}'),

('Eiffel Tower', 'Iconic iron lattice tower and symbol of Paris, offering stunning city views.', 'Landmark', 'Paris', 'France', 48.8584, 2.2945, false, ARRAY['Instagrammable', 'Relax'], 120, ARRAY['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'], '{"tips": ["Book tickets in advance", "Evening illumination is magical", "Picnic in nearby Champ de Mars"]}'),

('Shibuya Crossing', 'The world''s busiest pedestrian crossing in the heart of Tokyo.', 'Landmark', 'Tokyo', 'Japan', 35.6598, 139.7006, false, ARRAY['Adventure', 'Instagrammable'], 45, ARRAY['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'], '{"tips": ["Best viewed from Starbucks above", "Rush hour offers most dramatic crossing", "Follow the flow of pedestrians"]}');