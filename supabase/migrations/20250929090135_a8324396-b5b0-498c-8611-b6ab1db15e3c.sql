-- Create cultural content table
CREATE TABLE public.cultural_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('tip', 'trivia', 'ar_fact', 'mini_lesson', 'greeting', 'custom')),
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  language TEXT,
  audio_url TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  cultural_xp INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cultural lessons table for structured learning
CREATE TABLE public.cultural_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  language TEXT,
  lesson_data JSONB NOT NULL, -- stores questions, answers, media
  duration_minutes INTEGER DEFAULT 5,
  cultural_xp INTEGER NOT NULL DEFAULT 25,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user cultural progress table
CREATE TABLE public.user_cultural_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.cultural_content(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.cultural_lessons(id) ON DELETE CASCADE,
  progress_type TEXT NOT NULL CHECK (progress_type IN ('content_viewed', 'lesson_completed', 'challenge_completed')),
  completion_data JSONB DEFAULT '{}',
  cultural_xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_content UNIQUE(user_id, content_id),
  CONSTRAINT unique_user_lesson UNIQUE(user_id, lesson_id),
  CONSTRAINT content_or_lesson_required CHECK (
    (content_id IS NOT NULL AND lesson_id IS NULL) OR 
    (content_id IS NULL AND lesson_id IS NOT NULL)
  )
);

-- Create AR hotspots table for landmarks
CREATE TABLE public.ar_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landmark_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  cultural_facts JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cultural_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cultural_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_hotspots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Cultural content is viewable by everyone" 
ON public.cultural_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Cultural lessons are viewable by everyone" 
ON public.cultural_lessons 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "AR hotspots are viewable by everyone" 
ON public.ar_hotspots 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their own cultural progress" 
ON public.user_cultural_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cultural progress" 
ON public.user_cultural_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cultural progress" 
ON public.user_cultural_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_cultural_content_city_country ON public.cultural_content(city, country);
CREATE INDEX idx_cultural_content_type ON public.cultural_content(content_type);
CREATE INDEX idx_cultural_lessons_city_country ON public.cultural_lessons(city, country);
CREATE INDEX idx_user_cultural_progress_user_id ON public.user_cultural_progress(user_id);
CREATE INDEX idx_ar_hotspots_city_country ON public.ar_hotspots(city, country);

-- Create trigger for updated_at
CREATE TRIGGER update_cultural_content_updated_at
BEFORE UPDATE ON public.cultural_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cultural_lessons_updated_at
BEFORE UPDATE ON public.cultural_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample cultural content
INSERT INTO public.cultural_content (title, content, content_type, city, country, language, cultural_xp, metadata) VALUES
('Japanese Greeting', 'Konnichiwa (こんにちは) means "good afternoon" and is the most common greeting in Japan. Bow slightly when saying it to show respect.', 'greeting', 'Tokyo', 'Japan', 'Japanese', 15, '{"pronunciation": "kon-nee-chee-wah", "formality": "neutral"}'),
('Bowing Etiquette', 'In Japan, the depth of your bow shows respect level. A slight nod (15°) for casual situations, 30° for formal greetings, and 45° for deep respect.', 'tip', 'Tokyo', 'Japan', 'Japanese', 10, '{"category": "etiquette"}'),
('Tokyo Tower Trivia', 'Tokyo Tower was inspired by the Eiffel Tower but is actually 13 meters taller! It was built in 1958 and painted in international orange and white for aircraft safety.', 'ar_fact', 'Tokyo', 'Japan', 'Japanese', 20, '{"landmark": "Tokyo Tower"}'),
('French Café Culture', 'In Paris, it''s perfectly normal to sit at a café for hours with just one coffee. Parisians use cafés as their living room - for reading, working, or people-watching.', 'tip', 'Paris', 'France', 'French', 10, '{"category": "culture"}'),
('Bonjour Protocol', 'Always say "Bonjour" when entering any shop in France. Not greeting the shopkeeper is considered rude. Say "Au revoir" when leaving.', 'greeting', 'Paris', 'France', 'French', 15, '{"pronunciation": "bon-ZHOOR", "time": "before 6pm"}');

-- Insert sample cultural lessons
INSERT INTO public.cultural_lessons (title, description, city, country, language, lesson_data, cultural_xp) VALUES
('Basic Japanese Greetings', 'Learn essential Japanese greetings for different times of day', 'Tokyo', 'Japan', 'Japanese', 
'{"questions": [
  {"type": "multiple_choice", "question": "How do you say good morning in Japanese?", "options": ["Konnichiwa", "Ohayo gozaimasu", "Konbanwa"], "correct": 1, "audio": "/audio/ohayo.mp3"},
  {"type": "pronunciation", "text": "Ohayo gozaimasu", "romanji": "oh-HAH-yoh goh-ZAH-ee-mahs", "meaning": "Good morning (polite)"}
], "completion_criteria": {"min_correct": 2}}', 25),
('French Politeness Basics', 'Master the art of French politeness in daily interactions', 'Paris', 'France', 'French',
'{"questions": [
  {"type": "multiple_choice", "question": "What should you always say when entering a French shop?", "options": ["Salut", "Bonjour", "Bonsoir"], "correct": 1},
  {"type": "scenario", "situation": "You accidentally bump into someone on the Metro", "response": "Excusez-moi" }
], "completion_criteria": {"min_correct": 2}}', 25);

-- Insert sample AR hotspots
INSERT INTO public.ar_hotspots (landmark_name, city, country, latitude, longitude, cultural_facts, image_url) VALUES
('Tokyo Tower', 'Tokyo', 'Japan', 35.6586, 139.7454, 
'[
  {"fact": "Built in 1958, inspired by the Eiffel Tower", "category": "history"},
  {"fact": "333 meters tall - taller than its inspiration!", "category": "architecture"}, 
  {"fact": "The red and white colors help aircraft see it", "category": "safety"}
]', '/images/tokyo-tower.jpg'),
('Senso-ji Temple', 'Tokyo', 'Japan', 35.7148, 139.7967,
'[
  {"fact": "Tokyo''s oldest temple, founded in 628 AD", "category": "history"},
  {"fact": "The thunder gate (Kaminarimon) weighs 700kg", "category": "architecture"},
  {"fact": "Fortune papers (omikuji) predict your luck", "category": "tradition"}
]', '/images/sensoji.jpg'),
('Eiffel Tower', 'Paris', 'France', 48.8584, 2.2945,
'[
  {"fact": "Built for the 1889 World''s Fair", "category": "history"},
  {"fact": "Grows 6 inches taller in summer due to thermal expansion", "category": "science"},
  {"fact": "Originally intended to be temporary!", "category": "history"}
]', '/images/eiffel-tower.jpg');