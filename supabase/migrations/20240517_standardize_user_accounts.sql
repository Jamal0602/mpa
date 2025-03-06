
-- Add MPA ID column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mpa_id TEXT;

-- Create a function to generate MPA ID format
CREATE OR REPLACE FUNCTION public.generate_mpa_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_part TEXT;
BEGIN
  -- Extract username from email or use user ID
  IF NEW.email IS NOT NULL THEN
    username_part := split_part(NEW.email, '@', 1);
  ELSE
    username_part := substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Update profile with MPA ID format
  UPDATE profiles
  SET mpa_id = LOWER(username_part || '@mpa')
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to generate MPA ID for new users
DROP TRIGGER IF EXISTS on_user_created_generate_mpa_id ON auth.users;
CREATE TRIGGER on_user_created_generate_mpa_id
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.generate_mpa_id();

-- Update existing profiles that don't have MPA IDs yet
UPDATE profiles
SET mpa_id = LOWER(COALESCE(username, 'user_' || substr(id::text, 1, 8)) || '@mpa')
WHERE mpa_id IS NULL;

-- Ensure Row Level Security is properly configured
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (role = 'admin')::boolean FROM profiles WHERE id = user_id;
$$;
