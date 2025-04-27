# routes/users.py

from flask import Blueprint, jsonify, request
import os
import psycopg2
import psycopg2.extras
from pgvector.psycopg2 import register_vector

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn

@users_bp.route('/recommended/events/<uuid:user_uuid>', methods=['GET'])
def recommend_events_by_user_tags(user_uuid):
    """
    GET /api/users/<user_uuid>/events/recommend-by-tags?limit=10
    1) Grab all distinct tags from events the user is in.
    2) Call recommend_events_by_tags(tag_list, limit).
    3) Return JSON of recommended events.
    """
    limit = request.args.get('limit', default=10, type=int)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # 1) Fetch all tags from events this user is attending
    cur.execute("""
        SELECT DISTINCT unnest(e.tags) AS tag
        FROM events e
        JOIN user_events ue
          ON ue.event_id = e.id
        WHERE ue.user_uuid = %s;
    """, (str(user_uuid),))

    tags = [row['tag'] for row in cur.fetchall()]

    # If they’re not in any events yet, just return an empty list
    if not tags:
        cur.close()
        conn.close()
        return jsonify([])

    # 2) Call the recommendation function
    cur.execute("""
        SELECT
          id,
          title,
          date,
          location,
          image,
          description
        FROM recommend_events_by_tags(%s::text[], %s);
    """, (tags, limit))

    recs = cur.fetchall()
    cur.close()
    conn.close()

    # 3) Format date → ISO and return
    for ev in recs:
        ev['date'] = ev['date'].isoformat()

    return jsonify(recs)
