from flask import Blueprint, jsonify
from db import get_db_connection, create_embedding
import os
import psycopg2
import psycopg2.extras
from datetime import date
import uuid
from flask import Blueprint, jsonify, request
from pgvector.psycopg2 import register_vector
import openai
from flasgger import swag_from


events_bp = Blueprint("events", __name__)  # Remove url_prefix as it's set in app.py


"""
Note have not implemented get evnet recomended to the user, using infromation about the user
beacause i don't think the font end can keep track of the users uuid accros pages.
"""


## get events


@events_bp.route("/", methods=["GET"])
@swag_from(
    {
        "tags": ["Events"],
        "summary": "Get all upcoming events",
        "description": "Retrieve all events with dates in the future",
        "responses": {
            "200": {
                "description": "List of events retrieved successfully",
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string", "example": "event123"},
                            "title": {
                                "type": "string",
                                "example": "Tech Conference 2025",
                            },
                            "date": {
                                "type": "string",
                                "format": "date",
                                "example": "2025-06-15",
                            },
                            "location": {
                                "type": "string",
                                "example": "University of Denver",
                            },
                            "image": {
                                "type": "string",
                                "example": "/images/default.png",
                            },
                            "description": {
                                "type": "string",
                                "example": "Annual technology conference",
                            },
                        },
                    },
                },
            },
            "500": {
                "description": "Server error",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {
                            "type": "string",
                            "example": "Database connection failed",
                        }
                    },
                },
            },
        },
    }
)
def get_all_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT id, title, date, location, description FROM events WHERE date > Now() ORDER BY date ASC LIMIT 100;"
        )
        rows = cursor.fetchall()
        conn.close()
        events = []

        print(rows[0])
        i = 0
        unq_titles = set()
        for row in rows:
            if row["title"] not in unq_titles:
                unq_titles.add(row["title"])
                events.append(
                    {
                        "title": row["title"],
                        "date": row["date"].isoformat(),
                        "location": row["location"],
                        "image": row.get("image", "/images/default.png"),
                        "description": row["description"],
                        "tags": row.get("tags", []),
                    }
                )
        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# adding events


@events_bp.route("/add", methods=["POST"])
@swag_from(
    {
        "tags": ["Events"],
        "summary": "Add a new event",
        "description": "Create a new event with the provided information",
        "parameters": [
            {
                "name": "body",
                "in": "body",
                "required": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "example": "Tech Conference 2025",
                            "required": True,
                        },
                        "date": {
                            "type": "string",
                            "format": "date",
                            "example": "2025-06-15",
                            "required": True,
                        },
                        "location": {
                            "type": "string",
                            "example": "University of Denver",
                        },
                        "image": {
                            "type": "string",
                            "example": "/images/default_event.png",
                        },
                        "description": {
                            "type": "string",
                            "example": "Annual technology conference",
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "example": ["tech", "conference", "annual"],
                        },
                    },
                },
            }
        ],
        "responses": {
            "201": {
                "description": "Event created successfully",
                "schema": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "title": {"type": "string"},
                        "date": {"type": "string", "format": "date"},
                        "location": {"type": "string"},
                        "image": {"type": "string"},
                        "description": {"type": "string"},
                        "tags": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
            "400": {
                "description": "Invalid input",
                "schema": {
                    "type": "object",
                    "properties": {"error": {"type": "string"}},
                },
            },
        },
    }
)
def add_event():
    try:
        data: dict = request.get_json()

        # Validate required fields
        if not data.get("title"):
            return jsonify({"error": "Title is required"}), 400
        if not data.get("date"):
            return jsonify({"error": "Date is required"}), 400

        # Extract data and generate UUID
        event_id = str(uuid.uuid4())  # Generate UUID for id
        title = data["title"]
        date = data["date"]
        location = data.get("location", "University of Denver")
        image = data.get("image", "./assets/default_event.png")
        description = data.get("description", "")
        tags = data.get("tags", [])

        # Generate embedding from event data
        embedding_text = f"{title} {description} {' '.join(tags)}"
        embedding = create_embedding(embedding_text)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Update query to include id field
        query = """
            INSERT INTO events (id, title, date, location, image, description, tags, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, date, location, image, description, tags;
        """

        cursor.execute(
            query,
            (
                event_id,  # Add event_id as first parameter
                title,
                date,
                location,
                image,
                description,
                tags,
                embedding,
            ),
        )

        # Get the created event
        new_event = cursor.fetchone()
        conn.commit()

        # Format response
        event_response = {
            "title": new_event[1],
            "date": new_event[2].isoformat(),
            "location": new_event[3],
            "image": new_event[4],
            "description": new_event[5],
            "tags": new_event[6],
        }

        cursor.close()
        conn.close()

        return jsonify(event_response), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@events_bp.route("/search/embed", methods=["POST"])
@swag_from(
    {
        "tags": ["Events"],
        "summary": "Search events by embedding similarity",
        "description": "Retrieve events similar to the provided text input using embeddings",
        "parameters": [
            {
                "name": "body",
                "in": "body",
                "required": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "example": "Tech Conference",
                            "required": True,
                        }
                    },
                    "required": ["text"],
                },
            }
        ],
        "responses": {
            "200": {
                "description": "List of similar events retrieved successfully",
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string", "example": "event123"},
                            "title": {
                                "type": "string",
                                "example": "Tech Conference 2025",
                            },
                            "date": {
                                "type": "string",
                                "format": "date",
                                "example": "2025-06-15",
                            },
                            "location": {
                                "type": "string",
                                "example": "University of Denver",
                            },
                            "image": {
                                "type": "string",
                                "example": "/images/default.png",
                            },
                            "description": {
                                "type": "string",
                                "example": "Annual technology conference",
                            },
                        },
                    },
                },
            },
            "400": {
                "description": "Invalid input",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string", "example": "Text input is required"}
                    },
                },
            },
            "500": {
                "description": "Server error",
                "schema": {
                    "type": "object",
                    "properties": {"error": {"type": "string"}},
                },
            },
        },
    }
)
def get_events_embedding():
    try:
        data: dict = request.get_json()
        text_input = data.get("text", "")
        limit = data.get("limit", 10)
        if not text_input:
            return jsonify({"error": "Text input is required"}), 400

        input_embedding = create_embedding(text_input)
        today = date.today()

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Notice: Added WHERE date >= %s
        cur.execute(
            """
            SELECT * FROM events 
            WHERE date >= %s
            ORDER BY embedding <-> %s 
            LIMIT %s;
            """,
            (today, str(input_embedding), limit),
        )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = []

        unq_titles = set()
        for row in rows:
            if row["title"] in unq_titles:
                continue
            unq_titles.add(row["title"])
            res = {
                "title": row["title"],
                "date": row["date"].strftime("%Y-%m-%d") if row["date"] else None,
                "location": row["location"],
                "image": row["image"],
                "description": row["description"],
                "tags": row["tags"],
            }
            results.append(res)

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


"""
I think remove is too complicated because it requeris you to create types of usesr, ones who can creat and remove events and ones who can't 
"""


# @events_bp.route("/events/org/add", methods=['POST'])
# def insert_organization(entryjson):
#     """
#     @swagger
#     POST /api/events/org/add
#     Description: Adds new organizations to the database.
#     Request Body: JSON array of organization objects with fields:
#         - id (string): Unique identifier for the organization.
#         - title (string): Title of the organization.
#         - location (string): Location of the organization.
#         - image (string, optional): URL of the organization image. Defaults to '/images/default.png'.
#         - description (string): Description of the organization.
#         - tags (list of strings, optional): Tags associated with the organization.
#     Response: 200 OK if successful.
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     for row in entryjson:
#         id = row.get('id')
#         title = row.get('title')
#         location = row.get('location')
#         image = row.get('image', '/images/default.png')
#         description = row.get('description')
#         tags = row.get('tags', [])
#         tags_text = " ".join(tags)
#         embedding = get_embedding_from_gpt(tags_text)
#         cursor.execute("""
#             INSERT INTO organization (id, title, location, image, description, tags, embedding)
#             VALUES (%s, %s, %s, %s, %s, %s, %s)
#             ON CONFLICT (id) DO NOTHING;
#         """, (id, title, location, image, description, tags, embedding))
#     conn.commit()
#     cursor.close()
#     conn.close()

# @events_bp.route("/events/org/remove", methods=['DELETE'])
# def remove_organization(entryjson):
#     """
#     @swagger
#     DELETE /api/events/org/remove
#     Description: Removes organizations from the database.
#     Request Body: JSON array of organization objects with fields:
#         - id (string): Unique identifier for the organization to be removed.
#     Response: 200 OK if successful.
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     for row in entryjson:
#         id = row.get('id')
#         cursor.execute("""
#             DELETE FROM organization
#             WHERE id = %s;
#         """, (id,))
#     conn.commit()
#     cursor.close()
#     conn.close()
