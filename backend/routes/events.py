from flask import Blueprint, jsonify
from db import get_db_connection
import os
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
from pgvector.psycopg2 import register_vector
import openai

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn

events_bp = Blueprint('events', __name__, url_prefix='/api')

# INSERTION FUNCTIONALITIES:

@events_bp.route('/events/add', methods=['POST'])
def insert_event(entryjson):
    """
    @swagger
    POST /api/events/add
    Description: Adds new events to the database.
    Request Body: JSON array of event objects with fields:
        - id (string): Unique identifier for the event.
        - title (string): Title of the event.
        - date (string): Date of the event in YYYY-MM-DD format.
        - location (string): Location of the event.
        - image (string, optional): URL of the event image. Defaults to '/images/default.png'.
        - description (string): Description of the event.
        - tags (list of strings, optional): Tags associated with the event.
    Response: 200 OK if successful.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    for row in entryjson:
        id = row.get('id')
        title = row.get('title')
        date = row.get('date')
        location = row.get('location')
        image = row.get('image', '/images/default.png')
        description = row.get('description')
        tags = row.get('tags', [])
        tags_text = " ".join(tags)
        embedding = get_embedding_from_gpt(tags_text)
        cursor.execute("""
            INSERT INTO events (id, title, date, location, image, description, tags, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (id, title, date, location, image, description, tags, embedding))
    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route('/events/remove', methods=['DELETE'])
def remove_event(entryjson):
    """
    @swagger
    DELETE /api/events/remove
    Description: Removes events from the database.
    Request Body: JSON array of event objects with fields:
        - id (string): Unique identifier for the event to be removed.
    Response: 200 OK if successful.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    for row in entryjson:
        id = row.get('id')
        cursor.execute("""
            DELETE FROM events
            WHERE id = %s;
        """, (id,))
    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route("/events/org/add", methods=['POST'])
def insert_organization(entryjson):
    """
    @swagger
    POST /api/events/org/add
    Description: Adds new organizations to the database.
    Request Body: JSON array of organization objects with fields:
        - id (string): Unique identifier for the organization.
        - title (string): Title of the organization.
        - location (string): Location of the organization.
        - image (string, optional): URL of the organization image. Defaults to '/images/default.png'.
        - description (string): Description of the organization.
        - tags (list of strings, optional): Tags associated with the organization.
    Response: 200 OK if successful.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    for row in entryjson:
        id = row.get('id')
        title = row.get('title')
        location = row.get('location')
        image = row.get('image', '/images/default.png')
        description = row.get('description')
        tags = row.get('tags', [])
        tags_text = " ".join(tags)
        embedding = get_embedding_from_gpt(tags_text)
        cursor.execute("""
            INSERT INTO organization (id, title, location, image, description, tags, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (id, title, location, image, description, tags, embedding))
    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route("/events/org/remove", methods=['DELETE'])
def remove_organization(entryjson):
    """
    @swagger
    DELETE /api/events/org/remove
    Description: Removes organizations from the database.
    Request Body: JSON array of organization objects with fields:
        - id (string): Unique identifier for the organization to be removed.
    Response: 200 OK if successful.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    for row in entryjson:
        id = row.get('id')
        cursor.execute("""
            DELETE FROM organization
            WHERE id = %s;
        """, (id,))
    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route('/events', methods=['GET'])
def get_all_events():
    """
    @swagger
    GET /api/events
    Description: Retrieves all upcoming events.
    Response: JSON array of event objects with fields:
        - id (string): Unique identifier for the event.
        - title (string): Title of the event.
        - date (string): Date of the event in YYYY-MM-DD format.
        - location (string): Location of the event.
        - image (string): URL of the event image.
        - description (string): Description of the event.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, event_date, location, description FROM events WHERE event_date > Now();")
    rows = cursor.fetchall()
    conn.close()
    events = []
    for row in rows:
        events.append({
            "id": row[0],
            "title": row[1],
            "date": row[2].strftime('%Y-%m-%d'),
            "location": row[3],
            "image": "/images/default.png",
            "description": row[4]
        })
    return jsonify(events)

@events_bp.route('/events/search/embed', methods=['POST'])
def search_events_by_embedding():
    """
    @swagger
    POST /api/events/search/embed
    Description: Searches for events similar to the input text based on embeddings.
    Request Body: JSON object with fields:
        - text (string): Input text to search for similar events.
        - limit (integer, optional): Maximum number of results to return. Defaults to 5.
    Response: JSON array of event objects with fields:
        - id (string): Unique identifier for the event.
        - title (string): Title of the event.
        - description (string): Description of the event.
        - location (string): Location of the event.
        - date (string): Date of the event in ISO format.
        - similarity (float): Similarity score.
    """
    data = request.get_json()
    text_input = data.get('text', '')
    limit = data.get('limit', 5)
    if not text_input:
        return jsonify({"error": "Text input is required"}), 400
    input_embedding = get_embedding_from_gpt(text_input)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT id, title, description, location, event_date AS date, 
               1 - (embedding <=> %s::vector) AS similarity
        FROM events
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
    """, (input_embedding, input_embedding, limit))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    results = []
    for row in rows:
        row['date'] = row['date'].isoformat() if row['date'] else None
        results.append(row)
    return jsonify(results)
