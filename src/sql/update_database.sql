
-- Add storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'projects', 'projects', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'projects'
);

INSERT INTO storage.buckets (id, name, public)
SELECT 'resumes', 'resumes', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'resumes'
);

-- Set RLS policies for storage buckets
CREATE POLICY "Public read access for projects bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

CREATE POLICY "Authenticated users can upload to projects bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Users can update their own objects in projects bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'projects');

CREATE POLICY "Users can delete their own objects in projects bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'projects');

-- Policies for resumes bucket (more restricted)
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'resumes');

CREATE POLICY "Authenticated users can upload to resumes bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Users can update their own objects in resumes bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'resumes');

CREATE POLICY "Users can delete their own objects in resumes bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'resumes');

-- Create job_positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for job_positions table
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job positions"
ON job_positions FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can insert job positions"
ON job_positions FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Only admins can update job positions"
ON job_positions FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Only admins can delete job positions"
ON job_positions FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Update job_applications table with additional fields
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Update referral bonus function to give 5 SP instead of 10
CREATE OR REPLACE FUNCTION public.process_referral_bonus(referred_user_id uuid, referrer_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  referrer_user_id UUID;
  referral_exists BOOLEAN;
BEGIN
  -- Check if the referrer exists
  SELECT id INTO referrer_user_id
  FROM profiles
  WHERE referral_code = referrer_code;
    
  IF referrer_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;
    
  -- Check if a referral already exists
  SELECT EXISTS (
    SELECT 1 FROM referrals 
    WHERE referred_id = referred_user_id
  ) INTO referral_exists;
    
  IF referral_exists THEN
    RAISE EXCEPTION 'User has already been referred';
  END IF;
    
  -- Update the referred user's profile to set referred_by
  UPDATE profiles
  SET referred_by = referrer_code
  WHERE id = referred_user_id;
    
  -- Add bonus points to both users (5 SP instead of 10)
  UPDATE profiles
  SET key_points = key_points + 5
  WHERE id = referred_user_id OR id = referrer_user_id;
    
  -- Record point transactions
  INSERT INTO key_points_transactions (user_id, amount, description, transaction_type)
  VALUES 
    (referred_user_id, 5, 'Referral bonus for joining', 'earn'),
    (referrer_user_id, 5, 'Bonus for referring a new user', 'earn');
    
  -- Create a referral record
  INSERT INTO referrals (referrer_id, referred_id, status, bonus_earned, completed_at)
  VALUES (referrer_user_id, referred_user_id, 'completed', 5, now());
    
  -- Create notifications
  INSERT INTO notifications (user_id, title, message, type)
  VALUES 
    (referred_user_id, 'Welcome Bonus', 'You received 5 Spark Points as a welcome bonus!', 'success'),
    (referrer_user_id, 'Referral Bonus', 'Someone joined using your referral code! You earned 5 Spark Points.', 'success');
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process referral: %', SQLERRM;
    RETURN FALSE;
END;
$function$;
