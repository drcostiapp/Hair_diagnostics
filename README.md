# DR. COSTI EXPERIENCE SIMULATOR

A production-oriented MVP for luxury staff behavior conditioning at **Dr. Costi House of Beauty**.

## Core Capabilities
- Role-based training for manager, receptionist, WhatsApp agent, hostess, nurse, and valet.
- WhatsApp-style simulation chat with AI patient behaviors.
- Three-layer AI architecture:
  1. **Client Simulator** (realistic patient role-play)
  2. **Evaluator** (silent scoring + violations)
  3. **Coach** (corrective premium feedback)
- Certification tracking with pass threshold (90+), average score requirements, and violation controls.
- Manager analytics dashboard and scenario management APIs.

## Tech Stack
- **Next.js 15 + TypeScript** (App Router)
- **Supabase** (Postgres/Auth/RLS)
- **OpenAI API** (simulation/evaluation/coaching)
- **Recharts** (score trend)

## Project Structure
- `app/` pages and API routes
- `components/` reusable UI blocks
- `lib/` prompts, AI orchestration, Supabase helpers, scoring rules
- `supabase/schema.sql` full database schema + policies
- `scripts/seed-scenarios.ts` inserts 15 required launch scenarios

## Local Setup
```bash
npm install
cp .env.example .env.local
# fill environment values
npm run dev
```

## Database Setup (Supabase)
1. Open SQL editor in Supabase.
2. Run `supabase/schema.sql`.
3. Seed launch scenarios:
```bash
npm run seed
```

## API Routes
- `POST /api/simulations/start`
- `POST /api/simulations/message`
- `POST /api/simulations/end`
- `GET /api/dashboard/staff`
- `GET /api/dashboard/user/:id`
- `GET /api/scenarios`
- `POST /api/scenarios`

## Certification Logic
- Simulation pass: `>= 90`
- Weighted rubric: Tone (25), SOP (25), Brevity (20), Emotional IQ (20), Luxury discipline (10)
- Auto-fail on luxury violations (salesy, discounting, chasing, incorrect fee, etc.)

## Deployment (Vercel + Supabase)
1. Push repo to Git provider.
2. Import project in Vercel.
3. Add environment variables from `.env.example`.
4. Configure Supabase project URL and keys.
5. Deploy.
6. Run seed script from CI or local one-time execution.

## Security Notes
- Server routes use Supabase service role key on backend only.
- RLS policies included for manager/global and staff/self access paths.
- Never expose service role key to client bundles.
