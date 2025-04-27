import requests
from db import get_db_connection
from ics import Calendar
import uuid
from icalendar import Calendar
import openai
from dotenv import load_dotenv

load_dotenv()

def create_embedding(text) -> list[float]:


    response = openai.embeddings.create(
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
    
    for component in cal.walk():
        if component.name == "VEVENT":
            # Extract fields safely
            title = str(component.get('summary')) if component.get('summary') else "Untitled Event"
            dtstart = component.get('dtstart').dt if component.get('dtstart') else None
            location = "University of Denver"  # Default location
            description = str(component.get('description')) if component.get('description') else None
            
            # Custom fields
            image = "./assest/default.png"# Normally not in ICS files unless hidden in description/url

            # tags not included because ics file does not have tags
            embedding = create_embedding(title + " " + description) if description else create_embedding(title)
            embedding = str(embedding)

            event_id = str(uuid.uuid4())
            tags = []


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
        




def main():
    try:
        add_ics_to_db()
        print("ICS data added to DB successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")



if __name__ == "__main__":
    main()
    print("Data pipeline executed successfully.")