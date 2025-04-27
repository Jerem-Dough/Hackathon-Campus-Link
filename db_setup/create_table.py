import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datapipeline import get_db_connection
from openai import OpenAI
import os
from dotenv import load_dotenv

api_key = "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"
client = OpenAI(api_key=api_key)


def create_extensions():
    conn = get_db_connection()
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    extensions = ["uuid-ossp", "pgcrypto", "vector"]

    try:
        for extension in extensions:
            cursor.execute(f"CREATE EXTENSION IF NOT EXISTS {extension};")
        print("Extensions created successfully")
    except Exception as e:
        print(f"Error creating extensions: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def create_functions():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Ensure pgvector extension is enabled
        # cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # # A) Aggregate to sum vectors
        # cursor.execute("""
        # CREATE AGGREGATE IF NOT EXISTS vector_sum(VECTOR) (
        #   SFUNC    = vector_add,
        #   STYPE    = VECTOR,
        #   INITCOND = '[' || array_to_string(array_fill('0'::float8, ARRAY[1536]), ',') || ']'
        # );
        # """)

        # B) Compute average embedding over a set of tags
        cursor.execute(
            """
        CREATE OR REPLACE FUNCTION avg_tag_embedding(in_tags TEXT[])
        RETURNS VECTOR(1536) LANGUAGE plpgsql IMMUTABLE AS $$
        DECLARE
          cnt   INT;
          summed VECTOR(1536);
        BEGIN
          SELECT
            COUNT(*),
            vector_sum(embedding)
          INTO cnt, summed
          FROM tag_embeddings
          WHERE tag = ANY(in_tags);

          IF cnt = 0 THEN
            RETURN '[' || array_to_string(array_fill('0'::float8, ARRAY[1536]), ',') || ']';
          END IF;

          RETURN summed * (1.0 / cnt);
        END;
        $$;
        """
        )

        # C) Recommend events by tag similarity
        cursor.execute(
            """
        CREATE OR REPLACE FUNCTION recommend_events_by_tags(
          in_tags TEXT[],
          in_limit INT DEFAULT 10
        ) RETURNS SETOF events LANGUAGE plpgsql STABLE AS $$
        BEGIN
          RETURN QUERY
          SELECT e.*
          FROM events e
          WHERE e.embedding IS NOT NULL
          ORDER BY e.embedding <=> avg_tag_embedding(in_tags)
          LIMIT in_limit;
        END;
        $$;
        """
        )

        # D) Recommend events for a specific user by their embedding
        cursor.execute(
            """
        CREATE OR REPLACE FUNCTION recommend_events_for_user(
          in_user_uuid UUID,
          in_limit INT DEFAULT 10
        ) RETURNS SETOF events LANGUAGE plpgsql STABLE AS $$
        DECLARE
          user_emb VECTOR(1536);
        BEGIN
          SELECT embedding
            INTO user_emb
            FROM users
            WHERE uuid = in_user_uuid;

          IF user_emb IS NULL THEN
            RETURN;
          END IF;

          RETURN QUERY
          SELECT e.*
          FROM events e
          WHERE e.embedding IS NOT NULL
          ORDER BY e.embedding <=> user_emb
          LIMIT in_limit;
        END;
        $$;
        """
        )

        # E) Recommend organizations for a specific user by their embedding
        cursor.execute(
            """
        CREATE OR REPLACE FUNCTION recommend_organizations(
            in_user_uuid UUID,
            in_limit INT DEFAULT 5
        )
        RETURNS SETOF organization LANGUAGE plpgsql STABLE AS $$
        DECLARE
            user_emb VECTOR(1536);
        BEGIN
            SELECT embedding
            INTO user_emb
            FROM users
            WHERE uuid = in_user_uuid;

            IF user_emb IS NULL THEN
                RETURN;
            END IF;

            RETURN QUERY
            SELECT o.*
            FROM organization o
            WHERE o.embedding IS NOT NULL
            ORDER BY o.embedding <=> user_emb
            LIMIT in_limit;
        END;
        $$;
        """
        )

        conn.commit()
        print("Functions created successfully")

    except Exception as e:
        conn.rollback()
        print(f"Error creating functions: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# for routers to work in events searches
def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Create organization table
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS organization (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                location TEXT,
                image TEXT,
                description TEXT,
                tags TEXT[],
                embedding VECTOR(1536)
            );
        """
        )

        # Create users table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                interest TEXT[],
                major TEXT,
                campus TEXT,
                organization_id TEXT REFERENCES organization(id),
                embedding VECTOR(1536)
            );
        """
        )

        # Create events table
        cursor.execute(
            """
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
        """
        )

        # Create forums table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS forums (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT,
                image TEXT
            );
        """
        )

        # Create forum_members table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS forum_members (
                forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
                user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
                PRIMARY KEY (forum_id, user_uuid)
            );
        """
        )

        # Create posts table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
                author_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now()
            );
        """
        )

        # Create tag_embeddings table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS tag_embeddings (
                tag TEXT PRIMARY KEY,
                embedding VECTOR(1536) NOT NULL
            );
        """
        )

        # Create index for events.embedding
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_embedding
            ON events
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """
        )

        # Create comments table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            comment TEXT,
            post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
            forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
            user_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT now()
            );
        """
        )

        conn.commit()
        print("All tables created successfully")

    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def add_dummy_organizations():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # List of dummy organizations
        organizations = [
            {
                "id": "org_cs_club",
                "title": "Computer Science Club",
                "location": "University of Denver",
                "image": "assets/orgs/cs_club.png",
                "description": "A community of computer science enthusiasts",
                "tags": ["programming", "technology", "computer science"],
            },
            {
                "id": "org_ai_society",
                "title": "AI Society",
                "location": "University of Denver",
                "image": "assets/orgs/ai_society.png",
                "description": "Exploring the frontiers of artificial intelligence",
                "tags": ["AI", "machine learning", "data science"],
            },
            {
                "id": "org_robotics",
                "title": "Robotics Club",
                "location": "University of Denver",
                "image": "assets/orgs/robotics.png",
                "description": "Building and programming robots",
                "tags": ["robotics", "engineering", "programming"],
            },
        ]

        # Insert organizations
        for org in organizations:
            # Create embedding from organization data
            embedding_text = (
                f"{org['title']} {org['description']} {' '.join(org['tags'])}"
            )

            response = client.embeddings.create(
                input=embedding_text, model="text-embedding-3-small"
            )
            embedding = response.data[0].embedding

            query = """
                INSERT INTO organization (id, title, location, image, description, tags, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING;
            """

            cursor.execute(
                query,
                (
                    org["id"],
                    org["title"].lower().strip(),
                    org["location"],
                    org["image"],
                    org["description"],
                    org["tags"],
                    embedding,
                ),
            )

        conn.commit()
        print("Dummy organizations added successfully")

    except Exception as e:
        conn.rollback()
        print(f"Error adding dummy organizations: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def create_dummy_forums():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # List of dummy forums
        forums = [
            {
                "name": "DU Computer Science Discussion",
                "description": "General discussion about CS courses, projects, and opportunities at DU",
                "image": "./assets/forums/defaultforum.png",
            },
            {
                "name": "Tech Career Network",
                "description": "Network with other students and professionals in tech. Share job opportunities and career advice",
                "image": "./assets/forums/defaultforum.png",
            },
            {
                "name": "Hackathon Planning",
                "description": "Discuss upcoming hackathons, form teams, and share project ideas",
                "image": "./assets/forums/defaultforum.png",
            },
        ]

        # Insert forums
        for forum in forums:
            query = """
                INSERT INTO forums (name, description, image)
                VALUES (%s, %s, %s)
                RETURNING id;
            """

            cursor.execute(query, (forum["name"], forum["description"], forum["image"]))

            forum_id = cursor.fetchone()[0]
            print(f"✓ Created forum: {forum['name']} (ID: {forum_id})")

        conn.commit()
        print("\nDummy forums added successfully")

    except Exception as e:
        conn.rollback()
        print(f"Error adding dummy forums: {str(e)}")
    finally:
        cursor.close()
        conn.close()


def main():
    # Debug prints for environment variables
    print("=== Environment Variables Debug ===")
    (
        print(f"OPENAI_API_KEY: {os.getenv("OPENAI_API_KEY")}...")
        if os.getenv("OPENAI_API_KEY")
        else print("OPENAI_API_KEY: Not set")
    )
    print(f"POSTGRES_USER: {os.getenv('POSTGRES_USER', 'Not set')}")
    print(f"POSTGRES_DB: {os.getenv('POSTGRES_DB', 'Not set')}")
    print("================================")

    create_extensions()
    create_tables()
    add_dummy_organizations()
    print("making SQL functions...")
    create_functions()
    create_dummy_forums()


if __name__ == "__main__":
    main()
