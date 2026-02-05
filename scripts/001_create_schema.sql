-- CRM Portal Database Schema

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent',
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CLIENTS TABLE
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
  status TEXT DEFAULT 'lead',
  stage TEXT DEFAULT 'new',
  source TEXT,
  referral_source TEXT,
  referral_client_id UUID,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  avatar_url TEXT,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_own" ON public.clients;
CREATE POLICY "clients_select_own" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert_own" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update_own" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete_own" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- CLIENT FILES TABLE
CREATE TABLE IF NOT EXISTS public.client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_files_select_own" ON public.client_files;
DROP POLICY IF EXISTS "client_files_insert_own" ON public.client_files;
DROP POLICY IF EXISTS "client_files_delete_own" ON public.client_files;
CREATE POLICY "client_files_select_own" ON public.client_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "client_files_insert_own" ON public.client_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "client_files_delete_own" ON public.client_files FOR DELETE USING (auth.uid() = user_id);

-- CONTACT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL,
  direction TEXT,
  outcome TEXT,
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_logs_select_own" ON public.contact_logs;
DROP POLICY IF EXISTS "contact_logs_insert_own" ON public.contact_logs;
DROP POLICY IF EXISTS "contact_logs_update_own" ON public.contact_logs;
DROP POLICY IF EXISTS "contact_logs_delete_own" ON public.contact_logs;
CREATE POLICY "contact_logs_select_own" ON public.contact_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contact_logs_insert_own" ON public.contact_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contact_logs_update_own" ON public.contact_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contact_logs_delete_own" ON public.contact_logs FOR DELETE USING (auth.uid() = user_id);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meeting',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  reminder_minutes INTEGER DEFAULT 30,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select_own" ON public.events;
DROP POLICY IF EXISTS "events_insert_own" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_delete_own" ON public.events;
CREATE POLICY "events_select_own" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- POLICIES TABLE
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT,
  carrier TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  premium_amount DECIMAL(12, 2),
  premium_frequency TEXT DEFAULT 'monthly',
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
DROP POLICY IF EXISTS "policies_select_own" ON public.policies;
DROP POLICY IF EXISTS "policies_insert_own" ON public.policies;
DROP POLICY IF EXISTS "policies_update_own" ON public.policies;
DROP POLICY IF EXISTS "policies_delete_own" ON public.policies;
CREATE POLICY "policies_select_own" ON public.policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "policies_insert_own" ON public.policies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "policies_update_own" ON public.policies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "policies_delete_own" ON public.policies FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT DEFAULT 'info',
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- USER SCRIPTS TABLE
CREATE TABLE IF NOT EXISTS public.user_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_scripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_scripts_select_own" ON public.user_scripts;
DROP POLICY IF EXISTS "user_scripts_insert_own" ON public.user_scripts;
DROP POLICY IF EXISTS "user_scripts_update_own" ON public.user_scripts;
DROP POLICY IF EXISTS "user_scripts_delete_own" ON public.user_scripts;
CREATE POLICY "user_scripts_select_own" ON public.user_scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_scripts_insert_own" ON public.user_scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_scripts_update_own" ON public.user_scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_scripts_delete_own" ON public.user_scripts FOR DELETE USING (auth.uid() = user_id);

-- PROFILE TRIGGER
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
