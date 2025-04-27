from flask import Blueprint, jsonify, request
from db import get_db_connection

forums_bp = Blueprint('forums', __name__, url_prefix='/api/forums')

# GET posts for a forum
@forums_bp.route('/<forum_id>/posts', methods=['GET'])
def get_forum_posts(forum_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, author_uuid, content, created_at
            FROM posts
            WHERE forum_id = %s
            ORDER BY created_at ASC;
        """, (forum_id,))
        rows = cursor.fetchall()

        posts = []
        for row in rows:
            posts.append({
                "id": row[0],
                "author_uuid": str(row[1]) if row[1] else None,
                "content": row[2],
                "created_at": row[3].isoformat() + 'Z'
            })

        return jsonify(posts), 200

    except Exception as e:
        print(f"Error fetching posts: {str(e)}")
        return jsonify({"error": "Failed to fetch posts"}), 500

    finally:
        cursor.close()
        conn.close()

# POST a new post to a forum
@forums_bp.route('/<forum_id>/posts', methods=['POST'])
def create_post(forum_id):
    data = request.get_json()

    post_id = data.get('post_id')  # Frontend must send unique post id
    author_uuid = data.get('author_uuid')
    content = data.get('content')

    if not post_id or not author_uuid or not content:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO posts (id, forum_id, author_uuid, content)
            VALUES (%s, %s, %s, %s);
        """, (post_id, forum_id, author_uuid, content))
        conn.commit()

        return jsonify({"message": "Post created successfully"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error creating post: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500

    finally:
        cursor.close()
        conn.close()

# POST a new comment to a post
@forums_bp.route('/<forum_id>/posts/<post_id>/comments', methods=['POST'])
def create_comment(forum_id, post_id):
    data = request.get_json()

    comment_text = data.get('comment')
    user_uuid = data.get('user_uuid')

    if not comment_text or not user_uuid:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO comments (comment, post_id, forum_id, user_uuid)
            VALUES (%s, %s, %s, %s);
        """, (comment_text, post_id, forum_id, user_uuid))
        conn.commit()

        return jsonify({"message": "Comment created successfully"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error creating comment: {str(e)}")
        return jsonify({"error": "Failed to create comment"}), 500

    finally:
        cursor.close()
        conn.close()

# GET comments for a post
@forums_bp.route('/<forum_id>/posts/<post_id>/comments', methods=['GET'])
def get_post_comments(forum_id, post_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, user_uuid, comment, created_at
            FROM comments
            WHERE forum_id = %s AND post_id = %s
            ORDER BY created_at ASC;
        """, (forum_id, post_id))
        rows = cursor.fetchall()

        comments = []
        for row in rows:
            comments.append({
                "id": str(row[0]),
                "user_uuid": str(row[1]) if row[1] else None,
                "comment": row[2],
                "created_at": row[3].isoformat() + 'Z'
            })

        return jsonify(comments), 200

    except Exception as e:
        print(f"Error fetching comments: {str(e)}")
        return jsonify({"error": "Failed to fetch comments"}), 500

    finally:
        cursor.close()
        conn.close()

