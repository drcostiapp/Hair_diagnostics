# Dr. Costi Experience Simulator

A private, production-ready MVP web application that trains Dr. Costi House of Beauty staff to deliver the _She Doesn't Wait_ Private Consultation experience with 95%+ accuracy before touching a real client.

It is not a generic chatbot. It is a luxury behavior-conditioning engine:

- **Client Simulator** — an AI patient that role-plays realistically (elegant, skeptical, price-sensitive, VIP, silent).
- **Evaluator** — a silent scoring layer that grades every transcript against the luxury SOPs.
- **Coach** — converts raw scores into direct, premium coaching feedback and corrected gold-standard replies.

---

## Stack

| Layer       | Tech                                      |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 14 (App Router, TypeScript)       |
| Styling     | Tailwind CSS, Cormorant Garamond + Inter  |
| Auth        | Supabase Auth (email / password)          |
| Database    | Supabase Postgres                         |
| AI          | OpenAI (`gpt-4o` by default)              |
| Deployment  | Vercel (frontend + API) + Supabase        |

---

## Project Layout

```
src/
├── app/
│   ├── login/                  # Luxury sign-in
│   ├── dashboard/              # Staff home
│   ├── scenarios/              # Filterable library
│   ├── simulation/[id]/        # WhatsApp-style role-play
│   ├── results/[id]/           # Score + corrections + coach notes
│   ├── manager/                # Team performance dashboard
│   ├── staff/[id]/             # Individual profile + certify panel
│   └── api/
│       ├── simulations/start|message|end
│       ├── scenarios/
│       ├── dashboard/staff, dashboard/user/[id]
│       └── manager/certify, manager/export, auth/signout
├── components/                 # AppLayout, ChatWindow, ScoreCard, …
├── lib/
│   ├── supabase/{client,server,admin}.ts
│   ├── ai/{client-simulator,evaluator,coach}.ts
│   ├── certification.ts
│   ├── auth.ts, env.ts, format.ts, cn.ts
└── types/database.ts

supabase/
├── schema.sql                  # All tables + RLS policies
└── seed.sql                    # 15 seed scenarios from the playbook

scripts/
└── seed.ts                     # Demo-user bootstrap (optional)

middleware.ts                   # Session refresh + route protection
```

---

## 1. Setup

### 1.1 Clone & install

```bash
npm install          # or pnpm / yarn
```

### 1.2 Environment

Copy `.env.example` → `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### 1.3 Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL editor** and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` to load the 15 scenarios.
4. Copy the **URL**, **anon key**, and **service_role key** into `.env.local`.

### 1.4 (Optional) Create demo users

```bash
npm run seed -- --users
```

This creates one user per role (password `ChangeMe!2026`):

- `manager@drcosti.local`
- `whatsapp@drcosti.local`
- `reception@drcosti.local`
- `hostess@drcosti.local`
- `valet@drcosti.local`
- `nurse@drcosti.local`

Rotate these before production. Managers can then create further staff accounts directly via Supabase Auth (and should upsert the matching row into `public.users`).

---

## 2. Run

```bash
npm run dev
```

Open `http://localhost:3000`. Unauthenticated users are redirected to `/login`.

---

## 3. Certification Rules

Encoded in `src/lib/certification.ts`:

- ≥ 5 scenarios completed for the staff member's role
- Average score ≥ 90 / 100
- Zero automatic luxury violations in the last 3 simulations
- Manager must flip the status to `certified` manually

An automatic **FAIL** triggers whenever the evaluator detects any of:

- Sounds salesy, discounts the experience, pressures, or chases
- Over-explains, uses casual slang, reveals internal complexity
- Gives wrong information (e.g. wrong fee)
- Breaks exclusivity or makes the experience feel ordinary

The evaluator returns structured JSON; the coach converts it into the 8-part feedback block.

### Score Breakdown (100 pts)

| Dimension               | Max |
| ----------------------- | --: |
| Tone & elegance         |  25 |
| SOP accuracy            |  25 |
| Brevity & control       |  20 |
| Emotional intelligence  |  20 |
| Luxury discipline       |  10 |

Passing: `final_score ≥ 90` AND no automatic luxury violation.

---

## 4. Security

- All AI + data-mutating routes go through `requireUser()` / `requireManager()`.
- Row Level Security is enabled on every table. Direct-client reads are self-only.
- Writes happen server-side with the service-role key, never exposed to the browser.
- `middleware.ts` refuses any non-public route without a valid session.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` in Vercel's encrypted env — never commit.

---

## 5. Deployment (Vercel + Supabase)

1. Push this repo to GitHub.
2. On Vercel → **New Project** → import the repo.
3. Framework: **Next.js**. Build command: `next build`.
4. Add environment variables (everything from `.env.example`).
5. Deploy.

After the first deploy, add a custom domain (e.g. `training.drcosti.com`) in Vercel → Domains.

---

## 6. Extending

- **Add a scenario**: Managers can POST to `/api/scenarios`.
- **Add a role**: Update the `users.role` check constraint in `supabase/schema.sql` and the `ROLES` list in `ScenariosBrowser.tsx` / `format.ts`.
- **Change scoring weights**: Update the weights in `src/lib/ai/evaluator.ts` and the `max` values in `EvaluationPanel`.

---

## 7. Success Criteria

1. Staff can complete an AI role-play simulation end-to-end.
2. AI acts like a realistic high-value patient and does not break character.
3. Scores are consistent and aligned with the SOPs.
4. Results show corrected luxury responses, not generic praise.
5. Manager can track performance and flip certification.
6. The product _feels_ premium.
