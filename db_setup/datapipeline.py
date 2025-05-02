import os
import random
import requests
from datetime import date
from icalendar import Calendar as iCalendar
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import func
from threading import Thread

# import your models & DB setup
from models import (
    Base,
    engine,
    SessionLocal,
    Event,
    Forum,
    Post,
    Comment,
    Organization,
    User,
    scopedSession,
)

load_dotenv()

THREAD_NUMBER = 15

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment")

client = OpenAI(api_key=OPENAI_API_KEY)


def create_embedding(text: str) -> list[float]:
    resp = client.embeddings.create(input=text, model="text-embedding-3-small")
    return resp.data[0].embedding


def init_db():
    # ensure Postgres extensions
    with engine.connect() as conn:
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    # create tables
    Base.metadata.create_all(engine)


def create_dummy_data():
    session = SessionLocal()
    try:
        # — User —
        alice = User(
            name="Alice Smith",
            email="alice@example.com",
            interest="Tech, Music",
            campus="University of Denver",
            embedding=create_embedding("Alice Smith Tech Music University of Denver"),
        )
        bob = User(
            name="Bob Johnson",
            email="bob@example.com",
            interest="Art, Sports",
            campus="MSU Denver",
            embedding=create_embedding("Bob Johnson Art Sports MSU Denver"),
        )
        session.add_all([alice, bob])
        session.flush()  # populate their UUIDs

        # — Forum with members —
        forum = Forum(
            name="General Discussion",
            description="Talk about anything here.",
            image="https://example.com/forum.png",
            user=[alice, bob],  # Changed from members to user to match model definition
        )
        session.add(forum)
        session.flush()

        # — Posts —
        post1 = Post(
            forum=forum,
            author=alice,
            content="Welcome to the forum!",
            created_at=func.now(),  # Added created_at to match model requirements
        )
        post2 = Post(
            forum=forum,
            author=bob,
            content="Glad to be here.",
            created_at=func.now(),  # Added created_at to match model requirements
        )
        session.add_all([post1, post2])
        session.flush()

        # — Comments —
        comment1 = Comment(
            post=post1,
            user=bob,
            content="Thanks for the welcome!",  # Changed from comment to content to match model definition
            created_at=func.now(),  # Added created_at to match model requirements
        )
        comment2 = Comment(
            post=post2,
            user=alice,
            content="Enjoy your stay.",  # Changed from comment to content to match model definition
            created_at=func.now(),  # Added created_at to match model requirements
        )
        session.add_all([comment1, comment2])

        # — Dummy Event —
        dummy_event = Event(
            title="Dummy Conference",
            date=date.today(),
            location="Denver Tech Center",
            image="https://example.com/event.png",
            description="A test conference event.",
            tags="conference,tech,2025",
            embedding=create_embedding(
                "Dummy Conference Denver Tech Center A test conference event. conference,tech,2025"
            ),
        )
        session.add(dummy_event)

        # — Dummy Organization —
        org = Organization(
            title="Tech Club",
            campus="University of Denver",
            image="https://example.com/org.png",
            description="A club for tech enthusiasts.",
            tags="tech,club,students",
            members=[alice, bob],
            embedding=create_embedding(
                "Tech Club University of Denver A club for tech enthusiasts. tech,club,students"
            ),
        )
        session.add(org)

        session.commit()
        print("✅ Dummy data inserted successfully.")
    except SQLAlchemyError as e:
        session.rollback()
        print("❌ Error inserting dummy data:", e)
    finally:
        session.close()


def threaded_add_ics(start, end, events):
    session = scopedSession()
    print(session)
    imported = 0
    for i in range(start, end):
        if events[i].name != "VEVENT":
            continue

        comp = events[i]
        # parse fields
        title = str(comp.get("summary")) if comp.get("summary") else "Untitled Event"
        dtstart = comp.get("dtstart").dt if comp.get("dtstart") else None
        if not dtstart:
            continue
        # normalize to date
        event_date = dtstart.date() if hasattr(dtstart, "date") else dtstart

        location = str(comp.get("location")) or "University of Denver"
        description = str(comp.get("description")) if comp.get("description") else ""

        # skip duplicates
        if session.query(Event).filter_by(title=title).first():
            print(f"⚠️ Event {title} already exsists")
            continue

        # build embedding + record
        text_to_embed = title + (f" {description}" if description else "")
        embedding = create_embedding(text_to_embed)
        new_event = Event(
            title=title,
            date=event_date,
            location=location,
            image="./assets/default_event.png",
            description=description,
            tags="",
            embedding=embedding,
        )
        session.add(new_event)
        print(f"✅ Added new Event {title} ")
        imported += 1

    session.commit()
    session.close()
    print(f"✅ Imported {imported} new events from ICS.")


def add_ics_to_db():
    ICS_URL = "https://crimsonconnect.du.edu/ical/du/ical_du.ics"
    resp = requests.get(ICS_URL)
    cal = iCalendar.from_ical(resp.content)

    events = cal.walk()
    threads: list[Thread] = []
    over_flow = len(events) % THREAD_NUMBER
    chunk = len(events) // THREAD_NUMBER
    for i in range(0, THREAD_NUMBER):
        if i == THREAD_NUMBER - 1:
            t = Thread(
                target=threaded_add_ics,
                args=(i * chunk, (i + 1) * chunk + over_flow, events),
            )
        else:
            t = Thread(
                target=threaded_add_ics, args=(i * chunk, (i + 1) * chunk, events)
            )
            threads.append(t)
        t.start()

    for t in threads:
        t.join()


def main():
    init_db()
    create_dummy_data()
    add_ics_to_db()
    print("🎉 Data pipeline completed.")


if __name__ == "__main__":
    main()
