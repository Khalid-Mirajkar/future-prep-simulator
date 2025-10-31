-- Enable Row Level Security on insights table
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- The existing policy "Authenticated users can view insights" will now take effect