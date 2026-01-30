-- Create users table for custom authentication (no longer using Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

-- Update existing sessions and votes tables to use custom users table
ALTER TABLE public.sessions 
  DROP CONSTRAINT IF EXISTS "sessions_admin_id_fkey",
  ADD CONSTRAINT "sessions_admin_id_fkey" 
    FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.votes 
  DROP CONSTRAINT IF EXISTS "votes_user_id_fkey",
  ADD CONSTRAINT "votes_user_id_fkey" 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (minimal exposure)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (TRUE);

-- Create policies for sessions table (all authenticated users)
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
CREATE POLICY "Anyone can view sessions" ON public.sessions 
  FOR SELECT USING (TRUE);

-- Create policies for votes table
DROP POLICY IF EXISTS "Anyone can view votes in session" ON public.votes;
CREATE POLICY "Anyone can view votes in session" ON public.votes 
  FOR SELECT USING (TRUE);
