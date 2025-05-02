from flask import Blueprint, jsonify, request
from db import get_db_connection, create_embedding
from flasgger import swag_from
import openai
import os
import uuid


# ABE: look at app.py before adding url prefix
# or follow similar patter to first two functions
forums_bp = Blueprint("forums", __name__)


@forums_bp.route("/<forum_id>/posts", methods=["GET"])
@swag_from(
    {
        "tags": ["Forums"],
        "summary": "Get forum posts",
        "description": "Retrieve all posts for a specific forum",
        "parameters": [
            {
                "name": "forum_id",
                "in": "path",
                "type": "string",
                "required": True,
                "description": "UUID of the forum",
            }
        ],
        "responses": {
            "200": {
                "description": "List of posts retrieved successfully",
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "author_uuid": {"type": "string"},
                            "content": {"type": "string"},
                            "created_at": {"type": "string", "format": "date-time"},
                        },
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
def get_forum_posts(forum_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, author_uuid, content, created_at
            FROM posts
            WHERE forum_id = %s
            ORDER BY created_at ASC;
        """,
            (forum_id,),
        )
        rows = cursor.fetchall()

        posts = []
        for row in rows:
            posts.append(
                {
                    "id": row[0],
                    "author_uuid": str(row[1]) if row[1] else None,
                    "content": row[2],
                    "created_at": row[3].isoformat() + "Z",
                }
            )

        return jsonify(posts), 200

    except Exception as e:
        print(f"Error fetching posts: {str(e)}")
        return jsonify({"error": "Failed to fetch posts"}), 500

    finally:
        cursor.close()
        conn.close()


#  POST a new post to a forum
@forums_bp.route("/<forum_id>/posts", methods=["POST"])
@swag_from(
    {
        "tags": ["Forums"],
        "summary": "Create a new post",
        "description": "Add a new post to a specific forum",
        "parameters": [
            {
                "name": "forum_id",
                "in": "path",
                "type": "string",
                "required": True,
                "description": "UUID of the forum",
            },
            {
                "name": "body",
                "in": "body",
                "required": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "author_uuid": {
                            "type": "string",
                            "description": "UUID of the author",
                        },
                        "content": {
                            "type": "string",
                            "description": "Content of the post",
                        },
                    },
                    "required": ["author_uuid", "content"],
                },
            },
        ],
        "responses": {
            "201": {
                "description": "Post created successfully",
                "schema": {
                    "type": "object",
                    "properties": {
                        "author_uuid": {"type": "string"},
                        "content": {"type": "string"},
                    },
                    "required": ["author_uuid", "content"],
                },
            },
            "400": {
                "description": "Missing required fields",
                "schema": {
                    "type": "object",
                    "properties": {"error": {"type": "string"}},
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
def create_post(forum_id):
    data = request.get_json()

    post_id = str(uuid.uuid4())  # Generate unique post ID
    author_uuid = data.get("author_uuid")
    content = data.get("content")

    if not author_uuid or not content:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO posts (id, forum_id, author_uuid, content, created_at)
            VALUES (%s, %s, %s, %s, now());
        """,
            (post_id, forum_id, author_uuid, content),
        )
        conn.commit()

        return jsonify({"message": "Post created successfully"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error creating post: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500

    finally:
        cursor.close()
        conn.close()


#  POST a new comment to a post
@forums_bp.route("/<forum_id>/posts/<post_id>/comments", methods=["POST"])
def create_comment(forum_id, post_id):
    data = request.get_json()

    comment_text = data.get("comment")
    user_uuid = data.get("user_uuid")

    if not comment_text or not user_uuid:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO comments (comment, post_id, forum_id, user_uuid)
            VALUES (%s, %s, %s, %s);
        """,
            (comment_text, post_id, forum_id, user_uuid),
        )
        conn.commit()

        return jsonify({"message": "Comment created successfully"}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error creating comment: {str(e)}")
        return jsonify({"error": "Failed to create comment"}), 500

    finally:
        cursor.close()
        conn.close()


#  GET comments for a post
@forums_bp.route("/<forum_id>/posts/<post_id>/comments", methods=["GET"])
def get_post_comments(forum_id, post_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, user_uuid, comment, created_at
            FROM comments
            WHERE forum_id = %s AND post_id = %s
            ORDER BY created_at ASC;
        """,
            (forum_id, post_id),
        )
        rows = cursor.fetchall()

        comments = []
        for row in rows:
            comments.append(
                {
                    "id": str(row[0]),
                    "user_uuid": str(row[1]) if row[1] else None,
                    "comment": row[2],
                    "created_at": row[3].isoformat() + "Z",
                }
            )

        return jsonify(comments), 200

    except Exception as e:
        print(f"Error fetching comments: {str(e)}")
        return jsonify({"error": "Failed to fetch comments"}), 500

    finally:
        cursor.close()
        conn.close()


#  POST search forum posts
@forums_bp.route("/search", methods=["POST"])
def search_posts():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Missing search query"}), 400

    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.embeddings.create(input=query, model="text-embedding-3-small")
        search_embedding = response.data[0].embedding

    except Exception as e:
        print(f"Error creating embedding: {str(e)}")
        return jsonify({"error": "Failed to create search embedding"}), 500

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, forum_id, author_uuid, content, created_at
            FROM posts
            WHERE content IS NOT NULL
            ORDER BY embedding <=> %s
            LIMIT 10;
        """,
            (search_embedding,),
        )
        rows = cursor.fetchall()

        results = []
        for row in rows:
            results.append(
                {
                    "id": row[0],
                    "forum_id": str(row[1]),
                    "author_uuid": str(row[2]) if row[2] else None,
                    "content": row[3],
                    "created_at": row[4].isoformat() + "Z",
                }
            )

        return jsonify(results), 200

    except Exception as e:
        print(f"Error searching posts: {str(e)}")
        return jsonify({"error": "Failed to search posts"}), 500

    finally:
        cursor.close()
        conn.close()
