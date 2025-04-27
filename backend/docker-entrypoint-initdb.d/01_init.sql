\connect "EXPOS_THANI_WEB";

-- -- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Users table (stores user embeddings)
CREATE TABLE IF NOT EXISTS users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    interest TEXT[], -- list of things interested TEXT FORMAT
    major TEXT, -- major is a flat list of TAG (cs/etc.)
    campus TEXT, -- campus is flat list tag here, we can use another descript call
    organization_id TEXT REFERENCES organization(id), -- foreign key to organization table
    embedding VECTOR(1536)
);

CREATE TABLE IF NOT EXISTS organization (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT,
    image TEXT,
    description TEXT,
    tags TEXT[],
    embedding VECTOR(1536)
);

-- 3) Events table (with tags + event embeddings)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  image TEXT, -- Local file url call/pass in, SQL sanitization/entry required
  description TEXT,
  tags TEXT[],
  embedding VECTOR(1536)
);
-- 4) Forums table using UUID primary key
CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT
);

-- 5) Forum membership linking users to forums
CREATE TABLE IF NOT EXISTS forum_members (
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
  PRIMARY KEY (forum_id, user_uuid)
);

-- 6) Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7) Tag embeddings lookup
CREATE TABLE IF NOT EXISTS tag_embeddings (
  tag TEXT PRIMARY KEY,
  embedding VECTOR(1536) NOT NULL
);

-- 8) Index for fast nearest-neighbor on events.embedding
CREATE INDEX IF NOT EXISTS idx_events_embedding
  ON events
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);