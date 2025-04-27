from flask import Blueprint, jsonify
from db import get_db_connection

events_bp = Blueprint('events', __name__, url_prefix='/api')

@events_bp.route('/events', methods=['GET'])
def get_all_events():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, event_date, location FROM events;")
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
            "description": "Default description"  
        })

    return jsonify(events)
