create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('manager','receptionist','whatsapp_agent','hostess','nurse','valet')),
  branch text,
  status text default 'active',
  certification_status text default 'not_started',
  created_at timestamp default now()
);

create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  difficulty int not null,
  role_target text not null,
  scenario_context text not null,
  client_personality text not null,
  opening_message text not null,
  expected_behavior text not null,
  gold_standard_response text not null,
  fail_triggers text[] default '{}',
  sop_reference text not null,
  created_at timestamp default now()
);

create table if not exists simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  scenario_id uuid references scenarios(id) on delete set null,
  status text default 'in_progress',
  started_at timestamp default now(),
  ended_at timestamp,
  final_score int,
  pass_fail text,
  difficulty int,
  notes text
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid references simulations(id) on delete cascade,
  sender text not null check (sender in ('ai_client','trainee','system')),
  message text not null,
  timestamp timestamp default now()
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid references simulations(id) on delete cascade,
  tone_score int,
  sop_score int,
  brevity_score int,
  emotional_score int,
  discipline_score int,
  final_score int,
  pass_fail text,
  luxury_violations text[] default '{}',
  key_mistakes text[] default '{}',
  corrected_responses jsonb,
  recommendation text,
  evaluator_summary text,
  created_at timestamp default now()
);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text not null,
  required_scenarios_completed int default 0,
  average_score int,
  certification_status text,
  certified_at timestamp,
  manager_notes text
);

alter table users enable row level security;
alter table simulations enable row level security;
alter table messages enable row level security;
alter table evaluations enable row level security;
alter table certifications enable row level security;

create policy "managers read all users" on users for select using (auth.jwt() ->> 'role' = 'manager');
create policy "staff read own user row" on users for select using (auth.uid() = id);
create policy "staff read own simulations" on simulations for select using (auth.uid() = user_id);
create policy "staff read own messages" on messages for select using (
  exists (select 1 from simulations s where s.id = simulation_id and s.user_id = auth.uid())
);
create policy "staff read own evaluations" on evaluations for select using (
  exists (select 1 from simulations s where s.id = simulation_id and s.user_id = auth.uid())
);
