
-- Create a key_points_transactions table to track point usage
CREATE TABLE IF NOT EXISTS public.key_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'refund', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for key_points_transactions
ALTER TABLE public.key_points_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.key_points_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own transactions
CREATE POLICY "Users can insert their own transactions" 
ON public.key_points_transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to view all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.key_points_transactions FOR SELECT 
USING (public.is_admin());

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'success', 'error', 'warning', 'info'
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Create decrement_points function if it doesn't exist
CREATE OR REPLACE FUNCTION public.decrement_points(user_id UUID, amount_to_deduct INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Get current points
  SELECT key_points INTO current_points
  FROM profiles
  WHERE id = user_id;
  
  -- Return the new value (current points - amount to deduct)
  RETURN GREATEST(0, current_points - amount_to_deduct);
END;
$$;
