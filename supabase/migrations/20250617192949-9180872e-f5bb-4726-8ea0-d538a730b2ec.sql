
-- Create table for CV analysis results
CREATE TABLE public.cv_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  industry TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  ats_score INTEGER,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.cv_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for CV analyses
CREATE POLICY "Users can view their own CV analyses" 
  ON public.cv_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CV analyses" 
  ON public.cv_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV analyses" 
  ON public.cv_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for temporary CV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cv-uploads', 'cv-uploads', false);

-- Create storage policies for CV uploads
CREATE POLICY "Users can upload their CVs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cv-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their uploaded CVs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cv-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their uploaded CVs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cv-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
