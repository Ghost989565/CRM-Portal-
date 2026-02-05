-- CRM Portal Database Schema
-- This script creates all necessary tables for the CRM system

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'manager', 'admin')),
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  date_of_birth DATE,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'client', 'inactive')),
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'meeting-scheduled', 'proposal-sent', 'negotiation', 'closed-won', 'closed-lost')),
  source TEXT,
  referral_source TEXT,
  referral_client_id UUID REFERENCES public.clients(id),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  avatar_url TEXT,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert_own" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update_own" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete_own" ON public.clients FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_stage ON public.clients(stage);

-- ============================================
-- CLIENT FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'application', 'policy', 'id', 'medical', 'financial', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_files_select_own" ON public.client_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "client_files_insert_own" ON public.client_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "client_files_delete_own" ON public.client_files FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CONTACT LOGS TABLE (Interaction History)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('call', 'email', 'meeting', 'text', 'note')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  outcome TEXT,
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_logs_select_own" ON public.contact_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contact_logs_insert_own" ON public.contact_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contact_logs_update_own" ON public.contact_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contact_logs_delete_own" ON public.contact_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_contact_logs_client_id ON public.contact_logs(client_id);

-- ============================================
-- EVENTS TABLE (Calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'call', 'follow-up', 'presentation', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  reminder_minutes INTEGER DEFAULT 30,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_own" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'follow-up', 'call', 'email', 'meeting', 'paperwork', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- ============================================
-- POLICIES TABLE (Insurance Policies)
-- ============================================
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT,
  carrier TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('life', 'health', 'auto', 'home', 'disability', 'annuity', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'lapsed', 'cancelled', 'expired')),
  premium_amount DECIMAL(12, 2),
  premium_frequency TEXT DEFAULT 'monthly' CHECK (premium_frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual')),
  commission_amount DECIMAL(12, 2),
  commission_percentage DECIMAL(5, 2),
  effective_date DATE,
  expiration_date DATE,
  face_value DECIMAL(14, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policies_select_own" ON public.policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "policies_insert_own" ON public.policies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "policies_update_own" ON public.policies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "policies_delete_own" ON public.policies FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_policies_client_id ON public.policies(client_id);
CREATE INDEX idx_policies_user_id ON public.policies(user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'reminder')),
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================
-- USER SCRIPTS TABLE (User's custom/saved scripts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cold-call', 'follow-up', 'presentation', 'objection-handling', 'recruiting', 'email', 'custom')),
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_scripts_select_own" ON public.user_scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_scripts_insert_own" ON public.user_scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_scripts_update_own" ON public.user_scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_scripts_delete_own" ON public.user_scripts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PROFILE TRIGGER (Auto-create on signup)
-- ============================================
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
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a welcome notification for new users
  INSERT INTO public.notifications (user_id, title, message, notification_type)
  VALUES (
    NEW.id,
    'Welcome to CRM Portal!',
    'Get started by adding your first client or exploring the dashboard.',
    'success'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_scripts_updated_at BEFORE UPDATE ON public.user_scripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
