import requests
# from db import get_db_connection
from ics import Calendar
import uuid
from icalendar import Calendar
from openai import OpenAI
from dotenv import load_dotenv
import psycopg2

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
  


def add_ics_to_db():
    url = "https://crimsonconnect.du.edu/ical/du/ical_du.ics"
    response = requests.get(url)
    cal = Calendar.from_ical(response.content)

    conn = get_db_connection()
    cursor = conn.cursor()
    
    event_count = 0
    print("\n=== Starting Event Import ===")
    
    for component in cal.walk():
        if component.name == "VEVENT":
            # Extract fields safely
            title = str(component.get('summary')) if component.get('summary') else "Untitled Event"
            dtstart = component.get('dtstart').dt if component.get('dtstart') else None
            location = "University of Denver"  # Default location
            description = str(component.get('description')) if component.get('description') else None
            
            # Print event details before processing
            print(f"\nProcessing Event #{event_count + 1}")
            print(f"Title: {title}")
            print(f"Date: {dtstart}")
            print(f"Location: {location}")
            
            # Custom fields
            image = "./assest/default.png"
            embedding = create_embedding(title + " " + description) if description else create_embedding(title)
            embedding = str(embedding)
            event_id = str(uuid.uuid4())
            tags = []

            try:
                insert_query = """
                    INSERT INTO events (id, title, date, location, image, description, tags, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    event_id,
                    title,
                    dtstart,
                    location,
                    image,
                    description,
                    tags,
                    embedding
                ))
                event_count += 1
                print(f"✓ Successfully added event: {title}")
            except Exception as e:
                print(f"✗ Failed to add event: {title}")
                print(f"Error: {str(e)}")

    conn.commit()
    print(f"\n=== Import Complete ===")
    print(f"Total events processed: {event_count}")
    cursor.close()
    conn.close()
        




def main():
    try:
        add_ics_to_db()
        print("ICS data added to DB successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")



if __name__ == "__main__":
    main()
    print("Data pipeline executed successfully.")