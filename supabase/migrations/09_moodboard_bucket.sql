-- =============================================================
-- Moodboard Storage Bucket + Policies
-- =============================================================

-- Create public moodboards bucket (5 MB file size limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moodboards',
  'moodboards',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may upload to their own sub-folder ({userId}/…)
CREATE POLICY "Users can upload own moodboards"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'moodboards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read (bucket is public, explicit policy for clarity)
CREATE POLICY "Public can read moodboards"
ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'moodboards');

-- Authenticated users may delete their own files
CREATE POLICY "Users can delete own moodboards"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'moodboards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
