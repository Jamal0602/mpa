
-- Add file_format column to projects table
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS file_format TEXT;

-- Backfill existing projects with a default value based on category
UPDATE public.projects
SET file_format = 
  CASE 
    WHEN category = 'document' THEN 'pdf'
    WHEN category = 'image' THEN 'jpg'
    WHEN category = 'video' THEN 'mp4'
    WHEN category = 'audio' THEN 'mp3'
    WHEN category = 'archive' THEN 'zip'
    WHEN category = 'presentation' THEN 'ppt'
    WHEN category = 'spreadsheet' THEN 'xls'
    WHEN category = 'service' THEN 'service'
    ELSE 'other'
  END
WHERE file_format IS NULL;

-- Create a function to get file formats based on category
CREATE OR REPLACE FUNCTION public.get_file_formats(category TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN CASE
    WHEN category = 'document' THEN ARRAY['pdf', 'doc', 'docx', 'txt']
    WHEN category = 'image' THEN ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp']
    WHEN category = 'video' THEN ARRAY['mp4', 'mov', 'avi', 'webm']
    WHEN category = 'audio' THEN ARRAY['mp3', 'wav', 'ogg', 'm4a']
    WHEN category = 'archive' THEN ARRAY['zip', 'rar', '7z', 'tar', 'gz']
    WHEN category = 'presentation' THEN ARRAY['ppt', 'pptx', 'key']
    WHEN category = 'spreadsheet' THEN ARRAY['xls', 'xlsx', 'csv']
    WHEN category = 'service' THEN ARRAY['service']
    ELSE ARRAY['other']
  END;
END;
$$;
