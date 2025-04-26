\connect "EXPOS_THANI_WEB";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    campus VARCHAR(100),
    club VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Forums table 
CREATE TABLE IF NOT EXISTS forums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP,
    location VARCHAR(255)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES accounts(id),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    dark_mode_enabled BOOLEAN DEFAULT FALSE
);

-- Insert test accounts
INSERT INTO accounts (id, username, password_hash, campus, club)
VALUES 
    (uuid_generate_v4(), 'testuser1', 'fakehash1', 'Campus A', 'Club A'),
    (uuid_generate_v4(), 'testuser2', 'fakehash2', 'Campus B', 'Club B');

-- Note: For test forum inserts, you need real UUIDs matching real user ids!
-- So you usually SELECT user ids first, or temporarily skip linking them here.

-- Insert test events (no user linking needed)
INSERT INTO events (title, description, event_date, location)
VALUES 
    ('Spring Festival', 'Join us for food and games!', '2024-05-10 18:00:00', 'Main Quad'),
    ('Career Fair', 'Meet employers and explore internships.', '2024-05-15 10:00:00', 'Campus Center Hall');
