-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cultural', 'food', 'adventure', 'social'
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  xp_reward INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Missions are viewable by everyone
CREATE POLICY "Missions are viewable by everyone" 
ON public.missions 
FOR SELECT 
USING (true);

-- Create user_missions table to track progress
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  total_required INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS for user_missions
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own mission progress
CREATE POLICY "Users can view their own mission progress" 
ON public.user_missions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mission progress" 
ON public.user_missions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission progress" 
ON public.user_missions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold')),
  icon_url TEXT,
  criteria JSONB, -- Store criteria for earning the badge
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges 
FOR SELECT 
USING (true);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create places table for travel locations
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'temple', 'restaurant', 'museum', 'landmark', etc.
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  is_hidden_gem BOOLEAN DEFAULT false,
  cultural_tips JSONB, -- Store cultural information and tips
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for places
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Places are viewable by everyone
CREATE POLICY "Places are viewable by everyone" 
ON public.places 
FOR SELECT 
USING (true);

-- Create user_place_visits table
CREATE TABLE public.user_place_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  photos JSONB, -- Store photo URLs
  UNIQUE(user_id, place_id)
);

-- Enable RLS for user_place_visits
ALTER TABLE public.user_place_visits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own visits
CREATE POLICY "Users can view their own place visits" 
ON public.user_place_visits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own place visits" 
ON public.user_place_visits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own place visits" 
ON public.user_place_visits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_places_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample missions
INSERT INTO public.missions (title, description, category, difficulty, xp_reward) VALUES
('Temple Explorer', 'Visit 3 traditional temples in your current city', 'cultural', 'Medium', 150),
('Street Food Master', 'Try 5 local street foods', 'food', 'Easy', 200),
('Cultural Ambassador', 'Learn 10 basic phrases in the local language', 'cultural', 'Hard', 100),
('Hidden Gem Finder', 'Discover 2 off-the-beaten-path locations', 'adventure', 'Medium', 250),
('Local Connection', 'Have a conversation with 3 locals', 'social', 'Medium', 180),
('Art Enthusiast', 'Visit 2 art galleries or museums', 'cultural', 'Easy', 120),
('Market Explorer', 'Explore a traditional local market', 'cultural', 'Easy', 80),
('Sunrise Seeker', 'Watch sunrise from a scenic location', 'adventure', 'Hard', 300);

-- Insert sample badges
INSERT INTO public.badges (name, description, badge_type) VALUES
('First Steps', 'Completed your first mission', 'bronze'),
('Culture Seeker', 'Visited 10 cultural sites', 'silver'),
('Foodie Explorer', 'Tried 25 local dishes', 'gold'),
('Language Learner', 'Learned phrases in 3 languages', 'bronze'),
('Hidden Gem Finder', 'Discovered 5 off-beat locations', 'silver'),
('Master Explorer', 'Reached Level 10', 'gold'),
('Social Butterfly', 'Connected with 20 locals', 'silver'),
('Early Bird', 'Watched 5 sunrises in different locations', 'gold'),
('Art Lover', 'Visited 15 museums or galleries', 'silver'),
('Market Master', 'Explored markets in 10 different cities', 'bronze');