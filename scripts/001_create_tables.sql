-- CRM Portal Database Schema
-- This script creates all necessary tables with Row Level Security (RLS)

-- ================================================
-- PROFILES TABLE
-- ================================================
-- Stores user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'agent',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- ================================================
-- CLIENTS TABLE
-- ================================================
-- Stores CRM client information
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'New Lead',
  stage TEXT DEFAULT 'Prospect',
  tags TEXT[] DEFAULT '{}',
  next_appointment TIMESTAMPTZ,
  last_contact TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own" ON public.clients 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert_own" ON public.clients 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update_own" ON public.clients 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete_own" ON public.clients 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- CONTACT HISTORY TABLE
-- ================================================
-- Stores client contact logs
CREATE TABLE IF NOT EXISTS public.contact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'text', 'email', 'meeting')),
  outcome TEXT,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_history_select_own" ON public.contact_history 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contact_history_insert_own" ON public.contact_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contact_history_update_own" ON public.contact_history 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contact_history_delete_own" ON public.contact_history 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- CLIENT FILES TABLE
-- ================================================
-- Stores metadata for files attached to clients
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_files_select_own" ON public.client_files 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "client_files_insert_own" ON public.client_files 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "client_files_update_own" ON public.client_files 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "client_files_delete_own" ON public.client_files 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- SCRIPTS TABLE
-- ================================================
-- Stores sales/call scripts
CREATE TABLE IF NOT EXISTS public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scripts_select_own" ON public.scripts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scripts_insert_own" ON public.scripts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scripts_update_own" ON public.scripts 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scripts_delete_own" ON public.scripts 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- CALENDAR EVENTS TABLE
-- ================================================
-- Stores appointments and calendar events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT DEFAULT 'appointment',
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_events_select_own" ON public.calendar_events 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "calendar_events_insert_own" ON public.calendar_events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calendar_events_update_own" ON public.calendar_events 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "calendar_events_delete_own" ON public.calendar_events 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- PERFORMANCE METRICS TABLE
-- ================================================
-- Stores agent performance data
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calls_made INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  presentations_given INTEGER DEFAULT 0,
  policies_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "performance_metrics_select_own" ON public.performance_metrics 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "performance_metrics_insert_own" ON public.performance_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "performance_metrics_update_own" ON public.performance_metrics 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "performance_metrics_delete_own" ON public.performance_metrics 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- PROFILE TRIGGER
-- ================================================
-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON public.clients(stage);
CREATE INDEX IF NOT EXISTS idx_contact_history_client_id ON public.contact_history(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON public.scripts(user_id);
