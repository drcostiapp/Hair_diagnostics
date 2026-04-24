# Dr. Costi Experience Simulator

A private training web app for the Dr. Costi House of Beauty team.
The app feels like a WhatsApp conversation, but it is a controlled AI
role-play environment: staff rehearse the private-consultation client
experience against high-value patient personas, are scored out of 100 on
the Dr. Costi luxury standard, and get a coaching debrief.

Built as a production-ready MVP on **Next.js 14 (App Router) + Supabase
+ Anthropic Claude**.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Browser — Next.js App Router                  │
│  /login   /train   /train/:id   /results/:id   /dashboard        │
│  Luxury minimal UI · ivory + gold + dark-green anchor            │
└───────────────▲───────────────────────────▲──────────────────────┘
                │ Supabase JS (SSR cookies) │ fetch()
                │                           │
      ┌─────────┴──────────┐       ┌────────┴─────────────┐
      │  Supabase          │       │  Next.js Route       │
      │  Auth + Postgres   │       │  Handlers (/api/*)   │
      │  RLS-protected     │       │  chat · evaluate ·   │
      │  tables + views    │       │  simulations · auth  │
      └────────────────────┘       └──────────┬───────────┘
                                              │ Anthropic SDK
                                              ▼
                                   ┌───────────────────────┐
                                   │  Claude Sonnet 4.6+   │
                                   │  · role-plays client  │
                                   │  · scores transcript  │
                                   └───────────────────────┘
```

### Layers

- **Frontend** – React Server Components for the shell, client
  components only where interactivity is required (chat, login).
- **Auth & middleware** – `@supabase/ssr` cookie-based sessions,
  enforced in `middleware.ts`. Unauthenticated users are routed to
  `/login`; authenticated users are routed away from `/login`.
- **Database** – Postgres via Supabase. Every table has Row Level
  Security on. Managers are distinguished by a generated `is_manager`
  column and a `public.is_manager()` helper used by policies.
- **AI** – two prompts (`lib/prompts.ts`):
  1. a *client* system prompt that role-plays a high-value patient and
     never breaks character;
  2. an *evaluator* system prompt that scores the transcript as JSON
     against the 100-point rubric and the automatic-fail list.
- **Scoring** – Zod-validated JSON from Claude, persisted into
  `evaluations`. `total_score` and `passed` are generated columns so the
  DB is always the source of truth.

---

## 2. Database schema

Full SQL lives under `supabase/`. Run in order:

1. `supabase/schema.sql` — tables, enums, generated columns, scoreboard view
2. `supabase/policies.sql` — RLS policies and `is_manager()` helper
3. `supabase/trigger.sql` — `auth.users` → `public.users` mirror trigger
4. `supabase/seed.sql` — 30 seeded scenarios

Tables:

| table              | purpose                                             |
| ------------------ | --------------------------------------------------- |
| `users`            | staff profiles (role enum incl. `manager`)          |
| `scenarios`        | training scenarios, 10 categories × difficulty 1–5  |
| `simulations`      | one row per rehearsal attempt                       |
| `messages`         | chat turns (`ai` / `trainee` / `system`)            |
| `evaluations`      | per-simulation scorecard, auto-fail flags, rewrites |
| `staff_scoreboard` | view: per-staff averages, pass rate, last attempt   |

Generated columns enforce invariants:
- `evaluations.total_score` = sum of five sub-scores
- `evaluations.passed` = `not auto_fail AND total_score >= 80`
- `users.is_manager` = `role = 'manager'`

---

## 3. Frontend components

| path                                          | purpose                      |
| --------------------------------------------- | ---------------------------- |
| `app/page.tsx`                                | landing / entry              |
| `app/login/LoginForm.tsx`                     | sign in / request access     |
| `app/train/page.tsx`                          | scenario picker, grouped     |
| `app/train/StartScenarioButton.tsx`           | creates a simulation         |
| `app/train/[simulationId]/ChatWindow.tsx`     | WhatsApp-style chat UI       |
| `app/results/[simulationId]/page.tsx`         | score, mistakes, rewrites    |
| `app/dashboard/page.tsx`                      | manager scoreboard           |
| `components/Header.tsx`                       | shell with role badge        |
| `components/DifficultyDots.tsx`               | difficulty indicator         |

---

## 4. Backend API routes

| method | path                      | purpose                                               |
| ------ | ------------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/signout`       | clear session                                         |
| GET    | `/api/scenarios`          | list active scenarios (auth required)                 |
| POST   | `/api/simulations`        | create simulation + seed opening client message       |
| POST   | `/api/chat`               | append trainee turn, call Claude as client, persist   |
| POST   | `/api/evaluate`           | run evaluator against transcript, write evaluation    |
| GET    | `/api/health`             | uptime probe (public)                                 |

All mutating routes revalidate the caller's Supabase session and check
ownership of the simulation before acting.

---

## 5. AI prompts

See `lib/prompts.ts`. Two prompts drive the whole product:

- **`buildClientSystemPrompt(scenario, trainee)`** — the AI plays the
  *client*, not the staff. It must stay in character, never coach the
  trainee, escalate in proportion to `difficulty`, and react coolly to
  luxury violations without explaining why.
- **`buildEvaluatorSystemPrompt(scenario)`** — the AI plays the Head of
  Guest Experience. It must return a strict JSON payload with
  sub-scores, auto-fail flags, mistakes, luxury violations, gold-standard
  rewrites, and the recommended module to repeat. Parsed by Zod in
  `lib/scoring.ts` — unparseable output fails the request rather than
  silently writing bad data.

Both prompts share `LUXURY_DOCTRINE` and `NON_NEGOTIABLES` so the role-
player and the scorer use *the same rulebook*.

---

## 6. Step-by-step implementation plan

If you are cloning this fresh:

1. **Create the Supabase project**
   - In the Supabase dashboard, create a new project.
   - Copy the project URL, anon key, and service-role key.
2. **Run the SQL** (in order) in Supabase → SQL Editor:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
   - `supabase/trigger.sql`
   - `supabase/seed.sql`
3. **Enable email auth**
   - Supabase → Authentication → Providers → Email → enable password sign-in.
   - For internal use, disable public sign-ups after your staff are in, or
     configure an allow-list.
4. **Create the first manager**
   - Sign up normally via `/login?mode=signup` with role = Manager, OR
     update an existing row: `update public.users set role='manager' where email='you@costi.com';`
5. **Configure environment** — copy `.env.example` → `.env.local`, fill in.
6. **Install + run**:
   ```bash
   npm install
   npm run dev
   ```
7. **Smoke test**
   - Sign in, open a scenario, have a short back-and-forth, click
     *End & score*, confirm the results page renders with sub-scores.
   - As a manager, open `/dashboard` to verify the scoreboard.

---

## 7. Deployment — Vercel + Supabase

### Supabase (already done in §6 steps 1–3)
No further action besides keeping RLS **on** (it is, in `policies.sql`).

### Vercel

1. Push this repo to GitHub (the Claude agent branch is
   `claude/costi-training-simulator-zrRkA`).
2. In Vercel → *Add New Project* → import the repo.
3. Framework preset: **Next.js**. Build command and output: defaults.
4. Add environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_MODEL` *(optional, defaults to `claude-sonnet-4-6`)*
   - `NEXT_PUBLIC_SITE_URL` *(e.g. `https://simulator.drcosti.com`)*
5. In Supabase → Authentication → URL Configuration, set the Site URL
   and add the Vercel preview/prod URLs to Redirect URLs.
6. Deploy. The `/api/health` route should return `{ ok: true }`.
7. Optional: add a Vercel cron (`/api/health` nightly) to keep the edge warm.

### Security hardening (recommended before going live)

- Turn off open sign-ups once all staff are invited; manage users
  through Supabase dashboard instead.
- Rotate the Anthropic key on a schedule; it only lives server-side.
- In Supabase → Database → Network restrictions, lock the service-role
  key to Vercel egress IPs if possible.

---

## 8. Design direction

- **Warm ivory** background (`#F8F4EC`), **dark green anchor** text
  (`#14322B`), **gold** accents (`#C9A86A`).
- Serif display type (Cormorant Garamond) for headings, Inter for body.
- WhatsApp-style bubbles with refined corners, subtle gold divider, no
  childish gamification (no streaks, badges, confetti).
- Single-column focus in the chat; manager view is quietly tabular.

---

## 9. Non-negotiables enforced by the product

The same rules appear in the AI prompts *and* in the human-readable
training material, on purpose:

1. Never chase the client.
2. Never quote prices over chat.
3. Never offer discounts.
4. Never use casual language.
5. Never over-explain.
6. Never invent information.
7. Never break exclusivity tone.

Breaking any of them in a simulation triggers an automatic fail,
regardless of the numeric score.
