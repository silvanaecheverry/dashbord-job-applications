-- ============================================================================
-- Job Application Tracker — Supabase schema
-- Run this entire file once in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: keep `updated_at` current on every row update
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- 1. profiles — mirrors auth.users, one row per user
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. job_applications
-- ----------------------------------------------------------------------------
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  opening_date date,
  closing_date date,
  date_applied date,
  application_stage text not null default 'Not Applied'
    check (application_stage in ('Not Applied', 'Applied', 'Interview', 'Offer Received', 'Accepted', 'Rejected')),
  job_type text
    check (job_type in ('Full-Time', 'Part-Time', 'Freelance', 'Internship', 'Contract')),
  location_type text
    check (location_type in ('Office', 'Remote', 'Hybrid')),
  interest_level text
    check (interest_level in ('High', 'Medium', 'Low')),
  notes text,
  salary text,
  recruiter_name text,
  recruiter_linkedin text,
  job_link text,
  applied_where text
    check (applied_where in ('LinkedIn', 'Company Website', 'Direct Referral', 'Other Platform')),
  resume_submitted boolean not null default false,
  recommendation_letter boolean not null default false,
  wrote_to_recruiter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_applications_user_id_idx on public.job_applications(user_id);

alter table public.job_applications enable row level security;

create policy "Users manage their own job applications"
  on public.job_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_job_applications_updated_at on public.job_applications;
create trigger set_job_applications_updated_at
  before update on public.job_applications
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. interviews
-- ----------------------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interview_number integer not null default 1,
  date date,
  time time,
  type text check (type in ('In Person', 'Remote')),
  location text,
  contact_name text,
  contact_info text,
  interview_scheduled boolean not null default false,
  interview_done boolean not null default false,
  follow_up_sent boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interviews_application_id_idx on public.interviews(application_id);
create index if not exists interviews_user_id_idx on public.interviews(user_id);

alter table public.interviews enable row level security;

create policy "Users manage their own interviews"
  on public.interviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_interviews_updated_at on public.interviews;
create trigger set_interviews_updated_at
  before update on public.interviews
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. company_research
-- ----------------------------------------------------------------------------
create table if not exists public.company_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  website text,
  location text,
  industry text,
  company_size text,
  recruiter_name text,
  recruiter_linkedin text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_research_user_id_idx on public.company_research(user_id);

alter table public.company_research enable row level security;

create policy "Users manage their own company research"
  on public.company_research for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_company_research_updated_at on public.company_research;
create trigger set_company_research_updated_at
  before update on public.company_research
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. recruiters
-- ----------------------------------------------------------------------------
create table if not exists public.recruiters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  linkedin_url text,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recruiters_user_id_idx on public.recruiters(user_id);

alter table public.recruiters enable row level security;

create policy "Users manage their own recruiters"
  on public.recruiters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_recruiters_updated_at on public.recruiters;
create trigger set_recruiters_updated_at
  before update on public.recruiters
  for each row execute procedure public.set_updated_at();
