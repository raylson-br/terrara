-- Create a table for public profiles (accessible via RLS)
create table profiles (
  id uuid references auth.users not null primary key,
  credits_total int default 10000,
  credits_used int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Service role can update profiles"
  on profiles for update
  using ( true ); -- Service role bypasses RLS, but this is explicit for clarity if needed

-- Create a trigger to automatically create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, credits_total, credits_used)
  values (new.id, 10000, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (Run this once if you already have users)
insert into public.profiles (id, credits_total, credits_used)
select id, 10000, 0 from auth.users
on conflict (id) do nothing;

-- ============================================
-- LEADS TABLE (CRM)
-- ============================================
create table leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text not null,
  status text default 'in_progress' check (status in ('qualified', 'in_progress', 'disqualified')),
  last_interaction timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, phone)
);

-- RLS for leads
alter table leads enable row level security;

create policy "Users can view own leads"
  on leads for select
  using ( auth.uid() = user_id );

create policy "Users can insert own leads"
  on leads for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own leads"
  on leads for update
  using ( auth.uid() = user_id );

create policy "Service role can manage all leads"
  on leads for all
  using ( true );

-- ============================================
-- UPDATE INSTANCES TABLE (Add is_active column)
-- ============================================
alter table instances add column if not exists is_active boolean default true;
