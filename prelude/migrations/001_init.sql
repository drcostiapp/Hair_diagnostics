-- PRELUDE initial schema
-- Event-scoped nightlife social platform.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- provides gen_random_uuid()

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  phone               TEXT        NOT NULL UNIQUE,
  age                 INT         NOT NULL CHECK (age >= 18),
  gender              TEXT        NOT NULL,
  orientation         TEXT        NOT NULL,
  interests           TEXT[]      NOT NULL DEFAULT '{}',
  bio                 TEXT,
  -- 'unverified' | 'pending' | 'verified'
  verification_status TEXT        NOT NULL DEFAULT 'unverified',
  phone_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_admin            BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  venue       TEXT,
  city        TEXT,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  price_cents INT         NOT NULL DEFAULT 0,
  capacity    INT,
  created_by  UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);

-- ---------------------------------------------------------------------------
-- tickets  (one per user/event)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  -- 'pending' | 'paid' | 'refunded' | 'cancelled'
  status      TEXT        NOT NULL DEFAULT 'paid',
  price_cents INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets (event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id  ON tickets (user_id);

-- ---------------------------------------------------------------------------
-- attendance  (check-ins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance (event_id);

-- ---------------------------------------------------------------------------
-- social_edges  (like / pass / superlike), event-scoped & directional
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_edges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_a         UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE, -- actor
  user_b         UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE, -- target
  -- 'like' | 'pass' | 'superlike'
  edge_type      TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_a, user_b)
);
CREATE INDEX IF NOT EXISTS idx_social_edges_event_id ON social_edges (event_id);
CREATE INDEX IF NOT EXISTS idx_social_edges_target   ON social_edges (event_id, user_b);

-- ---------------------------------------------------------------------------
-- matches  (event-scoped, unordered pair stored as low/high)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_low   UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  user_high  UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_low, user_high),
  CHECK (user_low <> user_high)
);
CREATE INDEX IF NOT EXISTS idx_matches_event_id ON matches (event_id);

-- ---------------------------------------------------------------------------
-- chats  (1:1 chat tied to a match, expires at event end_time)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID        NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chats_event_id ON chats (event_id);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id    UUID        NOT NULL REFERENCES chats(id)  ON DELETE CASCADE,
  sender_id  UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages (chat_id, created_at);

-- ---------------------------------------------------------------------------
-- event_metrics  (aggregate counters per event)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_metrics (
  event_id     UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  tickets_sold INT         NOT NULL DEFAULT 0,
  checkins     INT         NOT NULL DEFAULT 0,
  likes        INT         NOT NULL DEFAULT 0,
  matches      INT         NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- ml_interactions  (audit trail of ML calls / feedback)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_interactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID        REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID        REFERENCES users(id)  ON DELETE CASCADE,
  -- 'rank' | 'train' | 'features'
  interaction   TEXT        NOT NULL,
  payload       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ml_interactions_event_id ON ml_interactions (event_id);

-- ---------------------------------------------------------------------------
-- reports  (safety)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        REFERENCES events(id) ON DELETE CASCADE,
  reporter_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_event_id ON reports (event_id);

-- ---------------------------------------------------------------------------
-- blocks  (global, not event-scoped)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker_id);
