-- Create insights table
CREATE TABLE public.insights (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  source_link TEXT,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read insights
CREATE POLICY "Authenticated users can view insights"
ON public.insights
FOR SELECT
TO authenticated
USING (true);

-- Create insight_tracker table
CREATE TABLE public.insight_tracker (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_ids INTEGER[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on insight_tracker
ALTER TABLE public.insight_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for insight_tracker
CREATE POLICY "Users can view their own insight tracker"
ON public.insight_tracker
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insight tracker"
ON public.insight_tracker
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight tracker"
ON public.insight_tracker
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);