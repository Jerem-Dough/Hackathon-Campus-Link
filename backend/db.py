import psycopg2
import os



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




def insert_event():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events (event_name) VALUES (%s)", ("Test Event",))
    conn.commit()
    cursor.close()
    conn.close()