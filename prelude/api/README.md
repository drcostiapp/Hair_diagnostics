# PRELUDE API

Backend for **PRELUDE** — a mobile-first nightlife social app. Users discover
events, buy tickets, unlock the attendee list, swipe/match, and chat. **Every
social interaction is event-scoped** — there is no global matching. You can only
see, swipe, match, and chat with people who hold a paid ticket to the *same*
event, and chats expire when that event ends.

Built with **NestJS + TypeScript**, **PostgreSQL** (via `pg`, no ORM), JWT auth,
and a **Socket.io** gateway for realtime chat + match notifications.

## Stack

- NestJS 10 (Express platform)
- PostgreSQL accessed through a thin `DatabaseService` wrapping a `pg` Pool
- `@nestjs/jwt` for phone-based auth (OTP is mocked)
- `@nestjs/config` for env config
- `class-validator` / `class-transformer` DTOs + global `ValidationPipe`
- `@nestjs/websockets` + `@nestjs/platform-socket.io`

## Setup

```bash
cd prelude/api
cp .env.example .env          # edit DATABASE_URL etc.
npm install

# create the schema (runs prelude/migrations/*.sql in order, tracked in schema_migrations)
npm run migrate

# insert demo users + an event
npm run seed

# run
npm run start:dev             # watch mode
# or
npm run build && npm start
```

### Environment

| Variable        | Purpose                                                        |
| --------------- | ------------------------------------------------------------- |
| `PORT`          | HTTP port (default 3000)                                       |
| `DATABASE_URL`  | Postgres connection string                                    |
| `JWT_SECRET`    | Secret for signing/verifying JWTs                             |
| `ML_SERVICE_URL`| Base URL of the ML ranking service                            |
| `ADMIN_PHONE`   | Comma-separated phone numbers treated as admins               |
| `MOCK_OTP`      | OTP accepted at login. Defaults to `0000`. Empty => any code  |
| `SWIPE_LIMIT`   | Max likes/superlikes per user per event (default 100)         |

## Auth

OTP is **mocked**: registering self-verifies the phone, and login accepts the
`MOCK_OTP` code (`0000` by default). Both endpoints return a JWT; send it as
`Authorization: Bearer <token>` on every other request (and in the Socket.io
handshake `auth.token`). The `verification_status` / `phone_verified` fields are
modeled on the user record.

## REST endpoints

All endpoints except `/auth/*` require a Bearer JWT.

### Auth
- `POST /auth/register` — `{ name, phone, age, gender, orientation, interests?, bio? }`
- `POST /auth/login` — `{ phone, otp }`

### Users
- `GET  /users/me`
- `PATCH /users/me` — partial `{ name?, age?, gender?, orientation?, interests?, bio? }`

### Events
- `GET  /events`
- `GET  /events/:id`
- `POST /events` — **admin only** — `{ title, start_time, end_time, description?, venue?, city?, price_cents?, capacity? }`

### Tickets / attendees
- `POST /tickets/purchase` — `{ event_id }` → creates a `paid` ticket (mock payment)
- `GET  /events/:id/attendees` — **403** unless caller holds a paid ticket
- `POST /events/:id/checkin` — requires a paid ticket

### Social (all require a paid ticket for the event)
- `GET  /social/feed?event_id=` — ranked candidates. Calls the ML service
  `POST {ML_SERVICE_URL}/ml/rank`; falls back to a deterministic local
  `MATCH_SCORE` ranking when the ML service is unavailable.
- `POST /social/like` — `{ event_id, target_user_id }`. If the target already
  liked you, creates a **match + chat** and emits `match_created`.
- `POST /social/pass` — `{ event_id, target_user_id }`
- `POST /social/superlike` — `{ event_id, target_user_id }`
- `GET  /social/matches?event_id=`
- `POST /social/report` — `{ event_id, target_user_id, reason }`
- `POST /social/block` — `{ target_user_id }`

Likes/superlikes are capped at `SWIPE_LIMIT` per user per event; exceeding it
returns **429**.

### Chat (REST history)
- `GET /chats/:id/messages` — message history (participants only)

### ML proxy passthroughs
- `POST /ml/rank`, `POST /ml/train`, `POST /ml/features` — forwarded to
  `ML_SERVICE_URL`.

## Realtime (Socket.io)

Connect with the JWT in the handshake:

```js
io('http://localhost:3000', { auth: { token: '<jwt>' } });
```

Events:
- `join_event(eventId)` — join the event room.
- `join_chat(chatId)` — join a chat room.
- `send_message({ chatId | matchId, text })` — persists a `chat_messages` row
  and broadcasts `new_message` to the chat room. Rejected (WsException) after
  the chat's `expires_at` (the event `end_time`), or for non-participants.
- `match_created` — emitted to **both** users when a reciprocal like creates a
  match. Payload: `{ matchId, chatId, eventId, users, expiresAt }`.
- `new_message` — emitted to a chat room on every new message.

## Matching score

The local fallback ranking uses the documented `MATCH_SCORE` formula
(`src/common/match-score.ts`):

```
0.30*intent_alignment + 0.20*interest_similarity + 0.20*behavioral_compatibility
+ 0.15*reciprocity_likelihood + 0.10*diversity_boost + 0.05*exploration_noise
```

multiplied by a time-decay factor based on the event start time:
`T-48h → 0.7`, `T-24h → 1.0`, `T-6h → 1.3`, `LIVE → 1.6` (linearly interpolated
between anchors). Exploration noise is derived deterministically from the
candidate id so the local ranking is reproducible.

## Database

Schema lives in `prelude/migrations/001_init.sql`: `users`, `events`, `tickets`,
`attendance`, `social_edges`, `matches`, `chats`, `chat_messages`,
`event_metrics`, `ml_interactions`, `reports`, `blocks`. UUID PKs via
`gen_random_uuid()`, FKs, `(event_id)` indexes, and uniqueness on
`tickets(event_id,user_id)`, `social_edges(event_id,user_a,user_b)`, and
`matches(event_id,user_low,user_high)`.

`npm run migrate` applies any not-yet-applied `*.sql` files in order and records
them in a `schema_migrations` table.

## Docker

```bash
docker build -t prelude-api .
docker run --rm -p 3000:3000 --env-file .env prelude-api
```
