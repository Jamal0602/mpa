
-- Create error_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS error_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type text NOT NULL,
  transaction_id text,
  description text NOT NULL,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolution_notes text,
  title text,
  error_message text,
  page_url text,
  browser_info text,
  steps_to_reproduce text,
  error_details jsonb
);

-- Set up RLS policies for error_reports
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON error_reports FOR SELECT
USING (auth.uid() = user_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
ON error_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can update reports
CREATE POLICY "Admins can update reports"
ON error_reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
