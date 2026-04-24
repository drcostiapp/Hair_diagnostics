-- =============================================================
-- Dr. Costi Experience Simulator — Supabase schema
-- =============================================================
-- Run once in the Supabase SQL editor. Safe to re-run: uses IF NOT EXISTS.
-- Auth is handled by auth.users. We mirror a profile record in public.users.

-- Extensions --------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums -------------------------------------------------------
do $$ begin
  create type staff_role as enum (
    'receptionist',
    'whatsapp_agent',
    'hostess',
    'nurse',
    'valet',
    'manager'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type scenario_category as enum (
    'whatsapp_inquiry',
    'price_objection',
    'vip_hesitation',
    'booking_confirmation',
    'live_location_request',
    'arrival_issue',
    'late_client',
    'post_visit_follow_up',
    'referral_conversation',
    'fully_booked_saturday'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type simulation_status as enum ('in_progress', 'completed', 'abandoned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_sender as enum ('ai', 'trainee', 'system');
exception when duplicate_object then null; end $$;

-- Users -------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role staff_role not null default 'receptionist',
  is_manager boolean generated always as (role = 'manager') stored,
  created_at timestamptz not null default now()
);

-- Scenarios ---------------------------------------------------
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category scenario_category not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  description text not null,
  client_persona text not null,
  opening_message text not null,
  gold_standard text not null,
  sop_reference text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists scenarios_cat_diff_idx
  on public.scenarios (category, difficulty);

-- Simulations -------------------------------------------------
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete restrict,
  status simulation_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  turn_count int not null default 0
);

create index if not exists simulations_user_idx on public.simulations (user_id, started_at desc);
create index if not exists simulations_scenario_idx on public.simulations (scenario_id);

-- Messages ----------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  sender message_sender not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_sim_idx on public.messages (simulation_id, created_at);

-- Evaluations -------------------------------------------------
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null unique references public.simulations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  score_tone smallint not null check (score_tone between 0 and 25),
  score_sop smallint not null check (score_sop between 0 and 25),
  score_brevity smallint not null check (score_brevity between 0 and 20),
  score_eq smallint not null check (score_eq between 0 and 20),
  score_luxury smallint not null check (score_luxury between 0 and 10),
  total_score smallint generated always as (
    score_tone + score_sop + score_brevity + score_eq + score_luxury
  ) stored,

  auto_fail boolean not null default false,
  fail_reasons text[] not null default '{}',
  mistakes text[] not null default '{}',
  luxury_violations text[] not null default '{}',
  corrected_responses jsonb not null default '[]'::jsonb,
  recommended_module text,

  passed boolean generated always as (
    not auto_fail and (
      score_tone + score_sop + score_brevity + score_eq + score_luxury
    ) >= 80
  ) stored,

  created_at timestamptz not null default now()
);

create index if not exists evaluations_user_idx on public.evaluations (user_id, created_at desc);

-- Helper: staff scoreboard view ------------------------------
create or replace view public.staff_scoreboard as
select
  u.id as user_id,
  u.full_name,
  u.role,
  count(e.id) as simulations_completed,
  coalesce(round(avg(e.total_score)::numeric, 1), 0) as avg_score,
  coalesce(
    round(
      100.0 *
      sum(case when e.passed then 1 else 0 end)::numeric /
      nullif(count(e.id), 0),
      1
    ),
    0
  ) as pass_rate,
  max(e.created_at) as last_simulation_at
from public.users u
left join public.evaluations e on e.user_id = u.id
group by u.id, u.full_name, u.role;
