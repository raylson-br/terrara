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
