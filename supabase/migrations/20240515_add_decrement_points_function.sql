
-- Function to safely decrement points with a check to avoid negative values
CREATE OR REPLACE FUNCTION public.decrement_points(user_id uuid, amount_to_deduct int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points int;
  new_points int;
BEGIN
  -- Get current points
  SELECT key_points INTO current_points
  FROM public.profiles
  WHERE id = user_id;
  
  -- Calculate new points, ensuring we don't go below zero
  new_points := GREATEST(0, current_points - amount_to_deduct);
  
  -- Return the new points value without updating
  -- The update will be handled by the caller
  RETURN new_points;
END;
$$;
