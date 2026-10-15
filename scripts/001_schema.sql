-- SatarkSetu · 001_schema.sql
-- Full database schema (SQLite). Safe to re-run: every object uses IF NOT EXISTS.
--   sqlite3 data/satarksetu.db < scripts/001_schema.sql

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Community reports: phishing emails, fake websites, scam numbers, fake UPI requests, and anonymous stories.
CREATE TABLE IF NOT EXISTS reports (
  id            TEXT PRIMARY KEY,              -- uuid4
  type          TEXT NOT NULL CHECK (type IN ('phishing','website','phone','upi','story')),
  identifier    TEXT,                          -- what was reported, as typed (NULL for stories)
  normalized    TEXT,                          -- canonical form used to match repeat reports
  title         TEXT,                          -- stories only
  description   TEXT NOT NULL,
  details       TEXT NOT NULL DEFAULT '{}',    -- JSON: brand, channel, city, subject, link, claim, app, pretext, category, lesson
  amount        INTEGER,                       -- rupees, whole numbers
  alias         TEXT,                          -- random public alias; no accounts, no names
  confirmations INTEGER NOT NULL DEFAULT 0,
  flags         INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden','removed')),
  demo          INTEGER NOT NULL DEFAULT 0,    -- 1 = illustrative sample, labelled in the UI
  created_at    TEXT NOT NULL                  -- ISO-8601 UTC
);
CREATE INDEX IF NOT EXISTS idx_reports_lookup  ON reports (type, normalized);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_flags   ON reports (status, flags DESC);

-- One confirm/flag per person per report. `voter` is HMAC-SHA256(VOTE_SECRET, ip|report_id):
-- raw IP addresses are never stored.
CREATE TABLE IF NOT EXISTS votes (
  report_id  TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('confirm','flag')),
  voter      TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (report_id, kind, voter)
);

-- Official advisories from government sources (see 002_advisories.sql).
CREATE TABLE IF NOT EXISTS advisories (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('phishing','website','phone','upi','story')),
  title      TEXT NOT NULL,
  issuer     TEXT NOT NULL,
  published  TEXT NOT NULL,                    -- YYYY-MM-DD
  summary    TEXT NOT NULL,
  tips       TEXT NOT NULL,                    -- JSON array of strings
  source_url TEXT NOT NULL,
  report_url TEXT
);

-- Registered users and sessions for email/password authentication
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,              -- uuid4
  email         TEXT NOT NULL UNIQUE,          -- lowercased, trimmed
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL,                 -- ISO-8601 UTC
  last_login_at TEXT                           -- ISO-8601 UTC
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS user_sessions (
  token         TEXT PRIMARY KEY,              -- random urlsafe token
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL,                 -- ISO-8601 UTC
  expires_at    TEXT NOT NULL                  -- ISO-8601 UTC
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions (user_id);

-- Suspected fraud communications reported nationally, by category and year.
CREATE TABLE IF NOT EXISTS national_stats (
  category TEXT NOT NULL,
  year     INTEGER NOT NULL,
  count    INTEGER NOT NULL,
  PRIMARY KEY (category, year)
);

-- Internal key/value settings (schema version, generated vote secret).
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1');

-- Handy views for anyone poking at the database directly.
CREATE VIEW IF NOT EXISTS v_public_reports AS
  SELECT id, type, identifier, title, description, amount, alias, confirmations, created_at
  FROM reports WHERE status = 'published';

CREATE VIEW IF NOT EXISTS v_report_counts AS
  SELECT type, status, COUNT(*) AS reports, SUM(confirmations) AS confirmations
  FROM reports GROUP BY type, status;
