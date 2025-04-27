\connect "EXPOS_THANI_WEB";

-- -- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- -- ENABLE pgvector:
-- CREATE EXTENSION vector;

-- -- 2. Add a 1536-dim “embedding” column to users (so we can store each user’s preference vector)
-- ALTER TABLE users
--   ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- -- 3. Add a matching embedding column to events
-- ALTER TABLE events
--   ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- -- 4. Create an approximate-nearest-neighbour index on events.embedding
-- CREATE INDEX IF NOT EXISTS idx_events_embedding
--   ON events
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);


  
-- -- Accounts table
-- CREATE TABLE IF NOT EXISTS accounts (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     campus VARCHAR(100),
--     club VARCHAR(100),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Forums table 
-- CREATE TABLE IF NOT EXISTS forums (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     content TEXT NOT NULL,
--     user_id UUID REFERENCES accounts(id),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Events table
-- CREATE TABLE IF NOT EXISTS events (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     event_date TIMESTAMP,
--     location VARCHAR(255),
--     embedding vector()
-- );

-- -- Settings table
-- CREATE TABLE IF NOT EXISTS settings (
--     id SERIAL PRIMARY KEY,
--     user_id UUID REFERENCES accounts(id),
--     notifications_enabled BOOLEAN DEFAULT TRUE,
--     dark_mode_enabled BOOLEAN DEFAULT FALSE
-- );

-- -- Insert test accounts
-- INSERT INTO accounts (id, username, password_hash, campus, club)
-- VALUES 
--     (uuid_generate_v4(), 'testuser1', 'fakehash1', 'Campus A', 'Club A'),
--     (uuid_generate_v4(), 'testuser2', 'fakehash2', 'Campus B', 'Club B');

-- -- Note: For test forum inserts, you need real UUIDs matching real user ids!
-- -- So you usually SELECT user ids first, or temporarily skip linking them here.

-- -- Insert test events (no user linking needed)
-- INSERT INTO events (title, description, event_date, location)
-- VALUES 
--     ('Spring Festival', 'Join us for food and games!', '2024-05-10 18:00:00', 'Main Quad'),
--     ('Career Fair', 'Meet employers and explore internships.', '2024-05-15 10:00:00', 'Campus Center Hall');


-- SELECT * FROM pg_extension;
-- 1) Enable required extensions
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