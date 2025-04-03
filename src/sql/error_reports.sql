
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

-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
ON error_reports FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create function to get error report statistics
CREATE OR REPLACE FUNCTION get_error_report_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
  pending_count INTEGER;
  in_progress_count INTEGER;
  resolved_count INTEGER;
  rejected_count INTEGER;
BEGIN
  -- Get counts for each status
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'in_progress'),
    COUNT(*) FILTER (WHERE status = 'resolved'),
    COUNT(*) FILTER (WHERE status = 'rejected')
  INTO
    total_count,
    pending_count,
    in_progress_count,
    resolved_count,
    rejected_count
  FROM error_reports;
  
  RETURN json_build_object(
    'total', total_count,
    'pending', pending_count,
    'in_progress', in_progress_count,
    'resolved', resolved_count,
    'rejected', rejected_count
  );
END;
$$;

-- Create function to count daily error reports by user
CREATE OR REPLACE FUNCTION user_daily_error_reports(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM error_reports
  WHERE error_reports.user_id = user_daily_error_reports.user_id
  AND created_at >= date_trunc('day', now());
  
  RETURN report_count;
END;
$$;
