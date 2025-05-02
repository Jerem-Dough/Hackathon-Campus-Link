import psycopg2
import os
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "mydatabase"
DB_USER = "myuser"
DB_PASSWORD = "mypassword"


def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    return conn


api_key = "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"
client = OpenAI(api_key=api_key)


def create_embedding(text) -> list[float]:

    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    # print(response)
    embedding = response.data[0].embedding
    return embedding


# --- Password utilities ---
def generate_password(raw_password: str) -> str:
    """
    Hash a raw password using PBKDF2+SHA256.
    Returns the salted hash to store in the DB.
    """
    return generate_password_hash(raw_password, method="pbkdf2:sha256", salt_length=16)


def verify_password(stored_hash: str, raw_password: str) -> bool:
    """
    Check a raw password against the stored hash.
    Returns True if they match.
    """
    return check_password_hash(stored_hash, raw_password)


def insert_event():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events (event_name) VALUES (%s)", ("Test Event",))
    conn.commit()
    cursor.close()
    conn.close()
