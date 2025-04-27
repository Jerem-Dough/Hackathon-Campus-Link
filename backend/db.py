import psycopg2
import os
from openai import OpenAI

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "mydatabase"
DB_USER = "myuser"
DB_PASSWORD = "mypassword"

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn




api_key = "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"
client = OpenAI(api_key=api_key)

def create_embedding(text) -> list[float]:


    response = client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
        )
    # print(response)
    embedding = response.data[0].embedding
    return embedding
  



def insert_event():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events (event_name) VALUES (%s)", ("Test Event",))
    conn.commit()
    cursor.close()
    conn.close()