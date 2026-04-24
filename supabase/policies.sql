-- =============================================================
-- Row Level Security policies
-- =============================================================
alter table public.users enable row level security;
alter table public.scenarios enable row level security;
alter table public.simulations enable row level security;
alter table public.messages enable row level security;
alter table public.evaluations enable row level security;

-- Helper to check manager status in the current jwt user --------
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'manager'
  );
$$;

-- USERS --------------------------------------------------------
drop policy if exists "users read self or manager" on public.users;
create policy "users read self or manager"
on public.users for select
using (auth.uid() = id or public.is_manager());

drop policy if exists "users insert self" on public.users;
create policy "users insert self"
on public.users for insert
with check (auth.uid() = id);

drop policy if exists "users update self or manager" on public.users;
create policy "users update self or manager"
on public.users for update
using (auth.uid() = id or public.is_manager())
with check (auth.uid() = id or public.is_manager());

-- SCENARIOS ----------------------------------------------------
drop policy if exists "scenarios readable by authenticated" on public.scenarios;
create policy "scenarios readable by authenticated"
on public.scenarios for select
using (auth.role() = 'authenticated' and is_active);

drop policy if exists "scenarios managed by managers" on public.scenarios;
create policy "scenarios managed by managers"
on public.scenarios for all
using (public.is_manager())
with check (public.is_manager());

-- SIMULATIONS --------------------------------------------------
drop policy if exists "simulations select own or manager" on public.simulations;
create policy "simulations select own or manager"
on public.simulations for select
using (user_id = auth.uid() or public.is_manager());

drop policy if exists "simulations insert own" on public.simulations;
create policy "simulations insert own"
on public.simulations for insert
with check (user_id = auth.uid());

drop policy if exists "simulations update own" on public.simulations;
create policy "simulations update own"
on public.simulations for update
using (user_id = auth.uid() or public.is_manager())
with check (user_id = auth.uid() or public.is_manager());

-- MESSAGES -----------------------------------------------------
drop policy if exists "messages select by sim owner or manager" on public.messages;
create policy "messages select by sim owner or manager"
on public.messages for select
using (
  exists (
    select 1 from public.simulations s
    where s.id = simulation_id
      and (s.user_id = auth.uid() or public.is_manager())
  )
);

drop policy if exists "messages insert by sim owner" on public.messages;
create policy "messages insert by sim owner"
on public.messages for insert
with check (
  exists (
    select 1 from public.simulations s
    where s.id = simulation_id and s.user_id = auth.uid()
  )
);

-- EVALUATIONS --------------------------------------------------
drop policy if exists "evaluations select own or manager" on public.evaluations;
create policy "evaluations select own or manager"
on public.evaluations for select
using (user_id = auth.uid() or public.is_manager());

drop policy if exists "evaluations insert own" on public.evaluations;
create policy "evaluations insert own"
on public.evaluations for insert
with check (user_id = auth.uid());
