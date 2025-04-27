from flask import Blueprint, jsonify
from db import get_db_connection

forums_bp = Blueprint('forums', __name__, url_prefix='/api/forums')

@forums_bp.route('/<forum_id>/posts', methods=['GET'])
def get_forum_posts(forum_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, content, created_at FROM forums WHERE id = %s;", (forum_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        posts = [{
            "id": "post001",
            "author": "Test Author",
            "content": row[1],
            "createdAt": row[2].isoformat() + 'Z'
        }]
    else:
        posts = []

    return jsonify(posts)
