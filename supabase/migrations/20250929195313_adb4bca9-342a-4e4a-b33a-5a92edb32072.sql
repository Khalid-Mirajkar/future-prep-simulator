-- Create waitlist table for AI Humanize Recruiter Video Call feature
CREATE TABLE public.video_interview_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.video_interview_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can insert their own waitlist entry
CREATE POLICY "Users can add themselves to waitlist"
ON public.video_interview_waitlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can view their own waitlist entry
CREATE POLICY "Users can view their own waitlist entry"
ON public.video_interview_waitlist
FOR SELECT
USING (auth.uid() = user_id);