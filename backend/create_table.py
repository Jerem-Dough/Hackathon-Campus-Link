import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from db import get_db_connection

# def create_extensions():
#     conn = get_db_connection()
#     conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
#     cursor = conn.cursor()
    
#     extensions = [
#         "uuid-ossp",
#         "pgcrypto",
#         "vector"
#     ]
    
#     try:
#         for extension in extensions:
#             cursor.execute(f"CREATE EXTENSION IF NOT EXISTS {extension};")
#         print("Extensions created successfully")
#     except Exception as e:
#         print(f"Error creating extensions: {str(e)}")
#     finally:
#         cursor.close()
#         conn.close()

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create organization table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS organization (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                location TEXT,
                image TEXT,
                description TEXT,
                tags TEXT[],
                embedding VECTOR(1536)
            );
        """)

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT,
                interest TEXT[],
                major TEXT,
                campus TEXT,
                organization_id TEXT REFERENCES organization(id),
                embedding VECTOR(1536)
            );
        """)

        # Create events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                date DATE NOT NULL,
                location TEXT,
                image TEXT,
                description TEXT,
                tags TEXT[],
                embedding VECTOR(1536)
            );
        """)

        # Create forums table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS forums (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT,
                image TEXT
            );
        """)

        # Create forum_members table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS forum_members (
                forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
                user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
                PRIMARY KEY (forum_id, user_uuid)
            );
        """)

        # Create posts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
                author_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now()
            );
        """)

        # Create tag_embeddings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tag_embeddings (
                tag TEXT PRIMARY KEY,
                embedding VECTOR(1536) NOT NULL
            );
        """)

        # Create index for events.embedding
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_events_embedding
            ON events
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """)

        # Create comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            comment TEXT,
            post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
            forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
            user_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT now()
            );
        """)
        
        conn.commit()
        print("All tables created successfully")

    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def main():
    # create_extensions()
    create_tables()

if __name__ == "__main__":
    main()