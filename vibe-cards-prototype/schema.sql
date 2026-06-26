-- Referanseskjema for produksjon (PostgreSQL).
-- Prototypen bruker en JSON-fil som datalager (se src/db.js) for rask oppstart
-- uten ekstern database, men datamodellen er identisk med skjemaet under.
-- Bytt til ekte Postgres ved å erstatte src/db.js med en pg-tilkobling.

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  mood        TEXT NOT NULL,           -- f.eks. "rolig", "energisk", "kreativ"
  color       TEXT NOT NULL,           -- hex-farge brukt som aksent i UI
  tags        TEXT[] NOT NULL DEFAULT '{}',
  likes       UUID[] NOT NULL DEFAULT '{}', -- bruker-id-er som har likt kortet
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_owner ON cards(owner_id);
CREATE INDEX idx_cards_mood ON cards(mood);
