-- ─────────────────────────────────────────────────────────────
-- Dr. Costi Experience Simulator — Supabase Schema
-- Run this once in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  name text not null,
  email text unique not null,
  role text not null check (
    role in ('manager','receptionist','whatsapp_agent','hostess','nurse','valet')
  ),
  branch text default 'Sama Beirut Tower — Ashrafieh',
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  certification_status text not null default 'not_started' check (
    certification_status in ('not_started','in_progress','certified','needs_retraining')
  ),
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role);
create index if not exists users_auth_idx on public.users(auth_id);

-- ─────────────────────────────────────────────────────────────
-- SCENARIOS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  difficulty int not null check (difficulty between 1 and 5),
  role_target text not null,
  scenario_context text not null,
  client_personality text,
  opening_message text not null,
  expected_behavior text,
  gold_standard_response text,
  fail_triggers text[] default '{}',
  sop_reference text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists scenarios_category_idx on public.scenarios(category);
create index if not exists scenarios_role_idx on public.scenarios(role_target);
create index if not exists scenarios_difficulty_idx on public.scenarios(difficulty);

-- ─────────────────────────────────────────────────────────────
-- SIMULATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  status text not null default 'in_progress' check (
    status in ('in_progress','completed','abandoned')
  ),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  final_score int,
  pass_fail text check (pass_fail in ('PASS','FAIL')),
  difficulty int,
  notes text
);

create index if not exists simulations_user_idx on public.simulations(user_id);
create index if not exists simulations_scenario_idx on public.simulations(scenario_id);
create index if not exists simulations_status_idx on public.simulations(status);

-- ─────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  sender text not null check (sender in ('ai_client','trainee','system')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_simulation_idx
  on public.messages(simulation_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- EVALUATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  tone_score int,
  sop_score int,
  brevity_score int,
  emotional_score int,
  discipline_score int,
  final_score int,
  pass_fail text check (pass_fail in ('PASS','FAIL')),
  luxury_violations text[] default '{}',
  key_mistakes text[] default '{}',
  best_response text,
  weakest_response text,
  corrected_responses jsonb default '[]'::jsonb,
  recommendation text,
  evaluator_summary text,
  created_at timestamptz not null default now()
);

create unique index if not exists evaluations_simulation_idx
  on public.evaluations(simulation_id);

-- ─────────────────────────────────────────────────────────────
-- CERTIFICATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  required_scenarios_completed int not null default 0,
  average_score int default 0,
  certification_status text not null default 'not_started' check (
    certification_status in ('not_started','in_progress','certified','needs_retraining')
  ),
  certified_at timestamptz,
  manager_notes text,
  updated_at timestamptz not null default now()
);

create unique index if not exists certifications_user_role_idx
  on public.certifications(user_id, role);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- Simple model: all reads/writes go through service-role server
-- routes. We still enable RLS to keep direct client access locked.
-- ─────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.scenarios enable row level security;
alter table public.simulations enable row level security;
alter table public.messages enable row level security;
alter table public.evaluations enable row level security;
alter table public.certifications enable row level security;

-- Scenarios: any authenticated user can read
drop policy if exists scenarios_read on public.scenarios;
create policy scenarios_read on public.scenarios
  for select to authenticated using (true);

-- Users: a user can read their own row
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select to authenticated
  using (auth_id = auth.uid());

-- Simulations / evaluations / messages / certifications: self-read only
drop policy if exists simulations_self_read on public.simulations;
create policy simulations_self_read on public.simulations
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));

drop policy if exists messages_self_read on public.messages;
create policy messages_self_read on public.messages
  for select to authenticated
  using (
    simulation_id in (
      select id from public.simulations
      where user_id in (select id from public.users where auth_id = auth.uid())
    )
  );

drop policy if exists evaluations_self_read on public.evaluations;
create policy evaluations_self_read on public.evaluations
  for select to authenticated
  using (
    simulation_id in (
      select id from public.simulations
      where user_id in (select id from public.users where auth_id = auth.uid())
    )
  );

drop policy if exists certifications_self_read on public.certifications;
create policy certifications_self_read on public.certifications
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));
