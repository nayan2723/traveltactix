-- Add crowd monitoring fields to places table
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS crowd_status TEXT CHECK (crowd_status IN ('low', 'medium', 'high')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS crowd_percentage INTEGER DEFAULT 50 CHECK (crowd_percentage >= 0 AND crowd_percentage <= 100),
ADD COLUMN IF NOT EXISTS best_visit_times JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_crowd_update TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient crowd status queries
CREATE INDEX IF NOT EXISTS idx_places_crowd_status ON public.places(crowd_status);
CREATE INDEX IF NOT EXISTS idx_places_last_crowd_update ON public.places(last_crowd_update);

-- Create user search history table
CREATE TABLE IF NOT EXISTS public.user_search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  search_query TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC
);

-- Enable RLS
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_search_history
CREATE POLICY "Users can view their own search history"
ON public.user_search_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history"
ON public.user_search_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient search history queries
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON public.user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_searched_at ON public.user_search_history(searched_at DESC);