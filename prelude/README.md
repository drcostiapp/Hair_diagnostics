# 📦 PRELUDE

> Event-scoped nightlife social platform — discover curated events → buy a
> ticket → unlock the attendee list → pre-match → chat → **meet in real life**.

PRELUDE optimizes for **real-world meet probability**, not engagement. Every
social graph is scoped to a single event: no global discovery, no global
matching, and chats are time-bound to the event lifecycle.

## Core principles (non-negotiable)

1. All social graphs are **event-scoped** (no global matching).
2. Users must **purchase a ticket** to access the attendee list.
3. Matching occurs **only between users in the same event**.
4. Chat is **time-bound** to the event lifecycle.
5. The system optimizes for **real-world meet probability**, not engagement.
6. **Gender balance** and event quality are enforced at the system level.

## Architecture

```
        ┌──────────────────────────┐
        │   Mobile App (Expo / RN)  │   prelude/mobile
        └─────────────┬────────────┘
                      │ REST + WebSocket
        ┌─────────────▼────────────┐
        │   API Gateway (NestJS)    │   prelude/api
        │  Auth · Users · Events    │
        │  Tickets · Social · Chat  │
        └──────┬────────────┬───────┘
               │            │ HTTP (rank/train/features)
       ┌───────▼──┐   ┌─────▼──────────┐
       │ Postgres │   │  ML Service     │   prelude/ml
       │  + Redis │   │  FastAPI +      │
       └──────────┘   │  XGBoost        │
                      └─────────────────┘
```

| Component | Path | Stack |
|-----------|------|-------|
| Mobile app | [`prelude/mobile`](./mobile) | React Native (Expo), TypeScript, Zustand, Reanimated, socket.io-client |
| Backend API + realtime | [`prelude/api`](./api) | NestJS, PostgreSQL (`pg`), JWT, Socket.io |
| ML ranking service | [`prelude/ml`](./ml) | Python, FastAPI, XGBoost |
| Database migrations | [`prelude/migrations`](./migrations) | Raw SQL (UUID schema) |
| Orchestration | [`docker-compose.yml`](./docker-compose.yml) | Postgres, Redis, API, ML |

## Quick start (Docker)

```bash
cd prelude
docker compose up --build
# API   -> http://localhost:3000
# ML    -> http://localhost:8000  (GET /health)
# Postgres -> localhost:5432  ·  Redis -> localhost:6379
```

The `api` container runs migrations automatically on boot. Then run the mobile
app pointed at the API:

```bash
cd prelude/mobile
cp .env.example .env
# set EXPO_PUBLIC_API_URL / EXPO_PUBLIC_SOCKET_URL (use your LAN IP on a device)
npm install && npx expo start
```

## System flow

```
join app → browse events → buy ticket → unlock attendee graph →
swipe → mutual like = match → chat opens → event happens →
feedback collected → ML retrains
```

## Matching engine

Candidate ordering inside an event maximizes
`P(mutual match + real-world interaction)`:

```
MATCH_SCORE = 0.30·intent_alignment
            + 0.20·interest_similarity
            + 0.20·behavioral_compatibility
            + 0.15·reciprocity_likelihood
            + 0.10·diversity_boost
            + 0.05·exploration_noise
```

with a time-decay multiplier as the event approaches:
`T-48h ×0.7 · T-24h ×1.0 · T-6h ×1.3 · LIVE ×1.6`.

The API calls the ML service `/ml/rank` for the swipe feed and falls back to a
local deterministic ranking using the same formula when ML is unavailable
(cold start). The ML service trains an XGBoost model on real mutual-like
outcomes and degrades to the heuristic scorer before any model exists.

## KPIs tracked

Real-world meet rate · matches per user · chat initiation rate ·
attendance rate · revenue per attendee (see `event_metrics`).

## Safety

Phone verification · optional ID verification · report/block ·
per-event gender-ratio targets · anti-spam swipe limits.

## Deployment

- API + ML ship as Docker images (see each subproject's `Dockerfile`); CI in
  [`.github/workflows/prelude-ci.yml`](../.github/workflows/prelude-ci.yml)
  builds all three and the Docker images.
- ML runs as a **separate** deployment so ranking scales independently.
- Mobile ships via Expo EAS (`eas build --platform ios|android`).
