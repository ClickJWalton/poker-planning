-- Drop existing tables if they exist to recreate with correct schema
DROP TABLE IF EXISTS public.votes;
DROP TABLE IF EXISTS public.sessions;

-- Create sessions table for poker planning sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table for storing user votes
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vote_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Sessions policies: anyone authenticated can view sessions
CREATE POLICY "Anyone can view sessions" ON public.sessions 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only the admin can create sessions
CREATE POLICY "Users can create sessions" ON public.sessions 
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- Only the admin can update sessions (for reveal)
CREATE POLICY "Admin can update their sessions" ON public.sessions 
  FOR UPDATE USING (auth.uid() = admin_id);

-- Only the admin can delete sessions
CREATE POLICY "Admin can delete their sessions" ON public.sessions 
  FOR DELETE USING (auth.uid() = admin_id);

-- Admin can delete all votes in their session (for reset)
CREATE POLICY "Admin can delete votes in their session" ON public.votes 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = votes.session_id 
      AND sessions.admin_id = auth.uid()
    )
  );

-- Votes policies: users can see all votes (needed for reveal)
CREATE POLICY "Anyone can view votes in session" ON public.votes 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can insert their own votes
CREATE POLICY "Users can submit their votes" ON public.votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their votes" ON public.votes 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their votes" ON public.votes 
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
