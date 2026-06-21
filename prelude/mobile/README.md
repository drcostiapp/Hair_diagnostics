# Prelude — Mobile

Mobile-first nightlife social app. Discover events, buy a ticket to unlock the
attendee list, swipe on attendees, match, and chat — all event-scoped.

Built with **React Native (Expo) + TypeScript**, React Navigation (native-stack),
Axios, Zustand, react-native-gesture-handler + reanimated (swipe deck), and
socket.io-client (realtime chat).

## Requirements

- Node 18+
- Expo CLI (`npx expo` — no global install needed)
- iOS Simulator / Android emulator, or the **Expo Go** app on a physical device

## Setup

```bash
cd prelude/mobile
cp .env.example .env        # then edit to point at your backend
npm install
npx expo start
```

Press `i` (iOS), `a` (Android), or `w` (web) in the Expo CLI, or scan the QR
code with Expo Go.

## Pointing at the backend

The app reads two public Expo env vars (anything prefixed `EXPO_PUBLIC_` is
inlined at build time):

| Variable                 | Purpose                      | Default                 |
| ------------------------ | ---------------------------- | ----------------------- |
| `EXPO_PUBLIC_API_URL`    | REST API base URL            | `http://localhost:3000` |
| `EXPO_PUBLIC_SOCKET_URL` | socket.io realtime base URL  | `http://localhost:3000` |

Set them in `.env` (copied from `.env.example`). If you run the backend on
another machine or test on a physical device, use your machine's LAN IP instead
of `localhost`, e.g.:

```
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.50:3000
```

Restart `expo start` after changing `.env`.

## Scripts

| Command           | What it does            |
| ----------------- | ----------------------- |
| `npm start`       | Start the Expo dev server |
| `npm run android` | Open on Android         |
| `npm run ios`     | Open on iOS             |
| `npm run web`     | Open in the browser     |

## Flow

`Splash → Login (phone + OTP, any code works in the MVP) → Events feed →
Event detail → Ticket (mock pay → unlock) → Swipe (animated stacked cards;
right = like, left = pass; match → banner) → Matches → Chat (realtime, scoped
to the event)`.

The attendee count on each event card stays **locked** until a ticket is
purchased for that event.

## Backend contract (assumed, flexible)

The API layer (`src/api/`) is defensive — most response fields are optional and
read with optional chaining — so partial/early backend responses won't crash the
UI. Expected shapes:

- **events**: `{ id, name, description, venue, start_time, end_time, capacity, ticket_price, vibe_tags, attendees_count }`
- **feed**: `{ users: [{ user_id, name, age, interests, score }] }`
- **matches**: `[{ id, user_a, user_b, chat_id }]`

REST endpoints used: `POST /auth/login`, `POST /auth/register`, `GET /auth/me`,
`GET /events`, `GET /events/:id`, `POST /events/:id/tickets`,
`GET /events/:id/attendees`, `GET /events/:id/feed`, `POST /events/:id/swipe`,
`GET /events/:id/matches`.

Socket events: client emits `join_event`, `leave_event`, `send_message`; server
emits `new_message`, `new_match`.

> Note: the MVP login and ticket-purchase flows fall back to local stubs if the
> backend is unreachable, so you can demo the full UX without a running server.

## Project structure

```
prelude/mobile/
  App.tsx                  # root, wrapped in GestureHandlerRootView
  src/
    api/        client.ts auth.ts events.ts tickets.ts social.ts socket.ts
    store/      useUserStore.ts useEventStore.ts useMatchStore.ts
    navigation/ AppNavigator.tsx
    screens/    Splash, Login, Events, EventDetail, Ticket, Swipe, Matches, Chat
    components/ EventCard, ProfileCard, SwipeCard, PrimaryButton, Tag, MatchRow
    constants/  theme.ts
    types.ts
```
