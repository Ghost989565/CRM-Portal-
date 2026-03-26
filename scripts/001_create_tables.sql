-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'agent',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  status text default 'New Lead',
  stage text default 'Prospect',
  assigned_agent text,
  tags text[] default '{}',
  next_appointment timestamp with time zone,
  last_contact timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.clients enable row level security;

create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id);
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);

-- Create contact_logs table
create table if not exists public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('call', 'text', 'email', 'meeting')),
  outcome text,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.contact_logs enable row level security;

create policy "contact_logs_select_own" on public.contact_logs for select using (auth.uid() = user_id);
create policy "contact_logs_insert_own" on public.contact_logs for insert with check (auth.uid() = user_id);
create policy "contact_logs_update_own" on public.contact_logs for update using (auth.uid() = user_id);
create policy "contact_logs_delete_own" on public.contact_logs for delete using (auth.uid() = user_id);

-- Create appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  type text default 'meeting',
  status text default 'scheduled',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.appointments enable row level security;

create policy "appointments_select_own" on public.appointments for select using (auth.uid() = user_id);
create policy "appointments_insert_own" on public.appointments for insert with check (auth.uid() = user_id);
create policy "appointments_update_own" on public.appointments for update using (auth.uid() = user_id);
create policy "appointments_delete_own" on public.appointments for delete using (auth.uid() = user_id);

-- Create client_files table
create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_type text,
  size integer,
  url text,
  created_at timestamp with time zone default now()
);

alter table public.client_files enable row level security;

create policy "client_files_select_own" on public.client_files for select using (auth.uid() = user_id);
create policy "client_files_insert_own" on public.client_files for insert with check (auth.uid() = user_id);
create policy "client_files_update_own" on public.client_files for update using (auth.uid() = user_id);
create policy "client_files_delete_own" on public.client_files for delete using (auth.uid() = user_id);

-- Create trigger function for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger for auto-creating profile
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create indexes for better performance
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_clients_status on public.clients(status);
create index if not exists idx_appointments_user_id on public.appointments(user_id);
create index if not exists idx_appointments_start_time on public.appointments(start_time);
create index if not exists idx_contact_logs_client_id on public.contact_logs(client_id);
