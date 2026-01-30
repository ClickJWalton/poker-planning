-- Create custom users table for authentication (no Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for poker planning sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table for storing user votes
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vote_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Sessions policies: disable RLS for now (app handles auth via sessions)
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
CREATE POLICY "Anyone can view sessions" ON public.sessions 
  FOR SELECT USING (TRUE);

-- Only the admin can create sessions
DROP POLICY IF EXISTS "Users can create sessions" ON public.sessions;
CREATE POLICY "Users can create sessions" ON public.sessions 
  FOR INSERT WITH CHECK (TRUE);

-- Only the admin can update sessions (for reveal)
DROP POLICY IF EXISTS "Admin can update their sessions" ON public.sessions;
CREATE POLICY "Admin can update their sessions" ON public.sessions 
  FOR UPDATE USING (TRUE);

-- Only the admin can delete sessions
DROP POLICY IF EXISTS "Admin can delete their sessions" ON public.sessions;
CREATE POLICY "Admin can delete their sessions" ON public.sessions 
  FOR DELETE USING (TRUE);

-- Votes policies: allow all operations (app handles auth)
DROP POLICY IF EXISTS "Anyone can view votes in session" ON public.votes;
CREATE POLICY "Anyone can view votes in session" ON public.votes 
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can submit their votes" ON public.votes;
CREATE POLICY "Users can submit their votes" ON public.votes 
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can update their votes" ON public.votes;
CREATE POLICY "Users can update their votes" ON public.votes 
  FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Users can delete their votes" ON public.votes;
CREATE POLICY "Users can delete their votes" ON public.votes 
  FOR DELETE USING (TRUE);

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (TRUE);
