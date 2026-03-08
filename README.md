# Vitalis — Personal Health Command Center

A premium personal health dashboard for tracking, analyzing, and optimizing your health data. Built as a persistent data system with AI-powered question answering and recommendation engine.

## Features

- **Dashboard** — Real-time health summary with key metrics, trend charts, active protocols, and recommendations
- **Daily Logging** — Track mood, energy, stress, hydration, steps, symptoms, sleep, and exercise
- **Nutrition** — Log meals with macros and calorie tracking
- **Supplements & Peptides** — Manage your full stack with dosage, frequency, and active/stopped status
- **Labs & Biomarkers** — Enter lab panels with reference ranges and automatic flagging
- **Body Metrics** — Track weight, body composition, and measurements with trend charts
- **Protocols** — Create and track health interventions with change logs
- **Timeline** — Chronological view of all health events and changes
- **Ask My Data** — Natural language questions answered using your stored health data
- **Recommendations** — AI-generated insights with confidence levels and action items
- **Settings** — Full profile, medical history, goals, and preferences

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Validation**: Zod
- **AI**: OpenAI-compatible API (configurable)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) OpenAI API key for AI-powered answers

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd Hair_diagnostics
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and optional AI API key
   ```

3. **Set up the database**:
   ```bash
   npm run db:push
   ```

4. **Seed demo data** (optional):
   ```bash
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AI_API_KEY` | OpenAI (or compatible) API key | No* |
| `AI_API_URL` | AI API endpoint URL | No |
| `AI_MODEL` | Model to use (e.g., `gpt-4o`) | No |

*Without an AI API key, the Ask My Data feature uses a local pattern-matching engine that still provides useful responses based on your stored data.

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for data fetching
│   ├── ask/               # AI question-answering interface
│   ├── body-metrics/      # Weight & body composition
│   ├── daily-log/         # Daily health logging
│   ├── labs/              # Lab panels & biomarkers
│   ├── nutrition/         # Meal tracking
│   ├── protocols/         # Protocol management
│   ├── settings/          # Profile & goals
│   ├── supplements-peptides/ # Supplement & peptide management
│   └── timeline/          # Event timeline
├── components/
│   ├── charts/            # Recharts wrapper components
│   ├── layout/            # Sidebar, navigation
│   └── ui/                # shadcn/ui primitives
└── lib/
    ├── actions.ts         # Server actions for data mutations
    ├── ai-engine.ts       # AI context building & question answering
    ├── auth.ts            # Single-user auth helper
    ├── dashboard-data.ts  # Dashboard data aggregation
    ├── prisma.ts          # Prisma client singleton
    └── utils.ts           # Utility functions
```

## Data Model

The system uses 25+ database models including:
- User profile, goals, and medical history
- Daily logs with mood, energy, stress, and more
- Meals with macro tracking
- Supplement, peptide, and medication management with logs
- Protocol tracking with change history
- Lab panels with biomarker reference ranges
- Body composition and weight tracking
- AI query history with responses
- Recommendations with confidence levels

## AI Layer

The AI engine:
1. Gathers all relevant user data from the database
2. Builds structured context from health records
3. Sends context + question to the AI provider (or uses local matching)
4. Returns answers with confidence levels and data citations
5. Stores all queries and responses for history

Without an API key, a local engine handles common question types:
- Status summaries
- Supplement/peptide queries
- Sleep/energy analysis
- Symptom patterns
- Lab reviews
- Recommendations

## Adding Future Features

- **New data types**: Add a Prisma model, create server actions in `actions.ts`, add an API route, and create a page
- **New chart types**: Create a component in `components/charts/` using Recharts
- **New AI capabilities**: Extend `generateLocalAnswer()` in `ai-engine.ts`
- **Import/Export**: Add API routes that read/write JSON or CSV

## Safety

This application includes medical disclaimer language and the AI layer:
- Distinguishes between data, patterns, hypotheses, and recommendations
- Labels confidence levels on all insights
- Flags concerning patterns for physician review
- Never presents speculation as fact
- Avoids dangerous dosing advice

**This tool is for personal wellness tracking only and does not provide medical advice.**

## License

MIT
