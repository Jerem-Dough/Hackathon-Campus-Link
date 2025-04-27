# routes/organizations.py

import os
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
from pgvector.psycopg2 import register_vector
from events import events_bp
# events_bp = Blueprint('organizations', __name__, url_prefix='/api/organizations')

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn

@events_bp.route('/recommended/orgs/<uuid:user_uuid>', methods=['GET'])
def recommend_organizations_for_user(user_uuid):
    """
    GET /api/organizations/orgs/recommended/<user_uuid>?limit=5
    Calls the recommend_organizations(user_uuid, limit) SQL function
    and returns a JSON array of organization records.
    """
    # Optional query parameter to override limit
    limit = request.args.get('limit', default=5, type=int)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Invoke the recommendation function
    cur.execute("""
        SELECT *
        FROM recommend_organizations(%s, %s);
    """, (str(user_uuid), limit))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    # Convert any date/time fields to ISO format
    results = []
    for row in rows:
        for key, val in row.items():
            if hasattr(val, 'isoformat'):
                row[key] = val.isoformat()
        results.append(row)
    return jsonify(results)
