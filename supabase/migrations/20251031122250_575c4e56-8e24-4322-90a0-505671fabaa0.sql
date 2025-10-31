-- Add UPDATE policy for CV uploads storage bucket
-- This allows users to update/replace their uploaded CVs if needed

CREATE POLICY "Users can update their uploaded CVs" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'cv-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'cv-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);