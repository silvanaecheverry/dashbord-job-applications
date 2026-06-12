-- ============================================================================
-- Job Application Tracker — public Supabase schema
-- Run this entire file in the Supabase SQL Editor.
--
-- This version intentionally does not use Supabase Auth. Anyone with the anon
-- key for this project can read and write these tracker tables.
-- ============================================================================

create extension if not exists pgcrypto;

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
-- Remove previous auth-owned artifacts if this project used the old schema
-- ----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles cascade;

-- ----------------------------------------------------------------------------
-- job_applications
-- ----------------------------------------------------------------------------
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
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

drop policy if exists "Users manage their own job applications" on public.job_applications;
drop index if exists public.job_applications_user_id_idx;
alter table public.job_applications drop column if exists user_id;
alter table public.job_applications disable row level security;

drop trigger if exists set_job_applications_updated_at on public.job_applications;
create trigger set_job_applications_updated_at
  before update on public.job_applications
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- interviews
-- ----------------------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
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

drop policy if exists "Users manage their own interviews" on public.interviews;
drop index if exists public.interviews_user_id_idx;
alter table public.interviews drop column if exists user_id;
alter table public.interviews disable row level security;

drop trigger if exists set_interviews_updated_at on public.interviews;
create trigger set_interviews_updated_at
  before update on public.interviews
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- company_research
-- ----------------------------------------------------------------------------
create table if not exists public.company_research (
  id uuid primary key default gen_random_uuid(),
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

drop policy if exists "Users manage their own company research" on public.company_research;
drop index if exists public.company_research_user_id_idx;
alter table public.company_research drop column if exists user_id;
alter table public.company_research disable row level security;

drop trigger if exists set_company_research_updated_at on public.company_research;
create trigger set_company_research_updated_at
  before update on public.company_research
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- recruiters
-- ----------------------------------------------------------------------------
create table if not exists public.recruiters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  linkedin_url text,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop policy if exists "Users manage their own recruiters" on public.recruiters;
drop index if exists public.recruiters_user_id_idx;
alter table public.recruiters drop column if exists user_id;
alter table public.recruiters disable row level security;

drop trigger if exists set_recruiters_updated_at on public.recruiters;
create trigger set_recruiters_updated_at
  before update on public.recruiters
  for each row execute procedure public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.job_applications,
  public.interviews,
  public.company_research,
  public.recruiters
to anon, authenticated;
