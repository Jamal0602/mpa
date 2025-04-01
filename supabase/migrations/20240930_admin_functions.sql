
-- Function to delete all users - can only be executed by service role or admin
CREATE OR REPLACE FUNCTION public.delete_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Only allow admin to run this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete all users';
  END IF;
  
  -- Get count of users to delete for reporting
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Delete all users (this will cascade due to foreign key relationships)
  DELETE FROM auth.users;
  
  RETURN json_build_object(
    'success', true,
    'message', 'All users deleted successfully',
    'count', user_count
  );
END;
$$;
