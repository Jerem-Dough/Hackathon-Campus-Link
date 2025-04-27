# routes/events.py
import os
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
from pgvector.psycopg2 import register_vector
from events import events_bp


def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn
@events_bp.route('/recommended/<uuid:user_uuid>', methods=['GET'])
def get_user_recommended_events(user_uuid):
    """
    GET /api/events/recommended/<user_uuid>?limit=10
    """
    # allow an optional ?limit= parameter (default to 10)
    limit = request.args.get('limit', default=10, type=int)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch the user's embedding data
    cur.execute("""
        SELECT embedding
        FROM users
        WHERE uuid = %s;
    """, (str(user_uuid),))
    user_embedding = cur.fetchone()

    # If no embedding is found for the user, return an empty list
    if not user_embedding or user_embedding['embedding'] is None:
        cur.close()
        conn.close()
        return jsonify([])

    # Call the SQL function with the user's embedding and limit
    cur.execute("""
        SELECT
          id,
          title,
          date,
          location,
          image,
          description
        FROM recommend_events_for_user(%s, %s);
    """, (user_uuid, limit))

    rows = cur.fetchall()
    cur.close()
    conn.close()
    # psycopg2.RealDictCursor already gives you dict-like rows:
    #   { 'id': ..., 'title': ..., 'date': dateobj, ... }
    # Just need to convert date to ISO format.
    events = []
    for row in rows:
        events.append({
            'id':          row['id'],
            'title':       row['title'],
            'date':        row['date'].isoformat(),
            'location':    row['location'],
            'image':       row['image'],
            'description': row['description'],
        })

    return jsonify(events)
