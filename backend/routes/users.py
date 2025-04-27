from flask import Blueprint, jsonify
from db import get_db_connection

users_bp = Blueprint('users', __name__, url_prefix='/api/users')
# this gets some selections, but they are not real vector searched recommendations

@users_bp.route('/<user_uuid>/events/recommendations', methods=['GET'])
def get_user_event_recommendations(user_uuid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, event_date, location FROM events LIMIT 5;")
    rows = cursor.fetchall()
    conn.close()

    recommendations = []
    for row in rows:
        recommendations.append({
            "id": row[0],
            "title": row[1],
            "date": row[2].strftime('%Y-%m-%d'),
            "location": row[3],
            "image": "/images/recommendation.png",
            "description": "Highly recommended event"
        })

    return jsonify(recommendations)

@users_bp.route('/<user_uuid>/forums', methods=['GET'])
def get_user_forums(user_uuid):
    conn = get_db_connection()
    cursor = conn.cursor()
    # You should ideally join a membership table here
    cursor.execute("SELECT id, title FROM forums LIMIT 3;")
    rows = cursor.fetchall()
    conn.close()

    forums = []
    for row in rows:
        forums.append({
            "id": row[0],
            "name": row[1],
            "description": "Sample description for forum",
            "image": "/images/forum.png",
            "memberCount": 100  # Dummy number for now? 
        })

    return jsonify(forums)
