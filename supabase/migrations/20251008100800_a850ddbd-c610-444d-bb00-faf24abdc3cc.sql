-- Add verification fields to user_missions table
ALTER TABLE public.user_missions
ADD COLUMN verification_type text CHECK (verification_type IN ('location', 'photo', 'checkin', 'quiz')) DEFAULT 'location',
ADD COLUMN verification_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN verification_status text CHECK (verification_status IN ('pending', 'in_progress', 'submitted', 'verified', 'rejected')) DEFAULT 'pending',
ADD COLUMN verification_notes text,
ADD COLUMN verified_at timestamp with time zone;

-- Update existing records to have default verification status
UPDATE public.user_missions
SET verification_status = 'in_progress'
WHERE is_completed = false;

UPDATE public.user_missions
SET verification_status = 'verified',
    verified_at = completed_at
WHERE is_completed = true;