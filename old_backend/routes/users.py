from flask import Blueprint, jsonify, request
from db import (
    get_db_connection,
    create_embedding,
    generate_password,
    check_password_hash,
)
from werkzeug.exceptions import Unauthorized
import openai
from flasgger import swag_from
from dotenv import load_dotenv

load_dotenv()

users_bp = Blueprint("users", __name__)


@users_bp.route("/create_user/", methods=["POST"])
@swag_from(
    {
        "tags": ["Users"],
        "summary": "Create a new user",
        "description": "Create a new user with provided information and generate embeddings",
        "parameters": [
            {
                "name": "body",
                "in": "body",
                "required": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "example": "John Doe",
                            "required": True,
                        },
                        "email": {
                            "type": "string",
                            "example": "johndoe@example.com",
                            "required": True,
                        },
                        "password": {
                            "type": "string",
                            "example": "securepassword123",
                            "required": True,
                        },
                        "interest": {
                            "type": "array",
                            "items": {"type": "string"},
                            "example": ["AI", "Machine Learning"],
                        },
                        "major": {"type": "string", "example": "Computer Science"},
                        "campus": {"type": "string", "example": "University of Denver"},
                        "organization_title": {
                            "type": "string",
                            "example": "AI Society",
                        },
                    },
                },
            }
        ],
        "responses": {
            "201": {
                "description": "User created successfully",
                "schema": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "example": "success"},
                        "id": {
                            "type": "string",
                            "example": "123e4567-e89b-12d3-a456-426614174000",
                        },
                    },
                },
            },
            "400": {
                "description": "Invalid input",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string", "example": "Name is required"},
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
                            "example": "Database error: connection failed",
                        },
                    },
                },
            },
        },
    }
)
def add_user():
    data = request.get_json() or {}

    # Required fields
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    # Optional fields
    interest = data.get("interest", [])
    if not isinstance(interest, list):
        return jsonify({"error": "Interest must be an array"}), 400

    major = data.get("major")
    campus = data.get("campus")
    org_title = data.get("organization_title", "").strip()

    # Connect & register pgvector adapter
    conn = get_db_connection()
    cur = conn.cursor()

    # Lookup organization by title (case-insensitive)
    org_id = None
    if org_title:
        cur.execute(
            "SELECT id FROM organization WHERE LOWER(title)=LOWER(%s)", (org_title,)
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return jsonify({"error": f"Organization '{org_title}' not found"}), 400
        org_id = row[0]

    # Hash password
    hashed_pw = generate_password(password)

    # Create embedding vector
    embed_text = f"{name} {' '.join(interest)} {major or ''} {campus or ''}"
    embedding = create_embedding(embed_text)  # returns List[float]

    # Insert into users table
    insert_sql = """
        INSERT INTO users
          (name, email, password, interest, major, campus, organization_id, embedding)
        VALUES
          (%s,   %s,    %s,       %s,       %s,     %s,      %s,             %s)
        RETURNING uuid;
    """
    cur.execute(
        insert_sql, (name, email, hashed_pw, interest, major, campus, org_id, embedding)
    )
    new_uuid = cur.fetchone()[0]
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"status": "success", "id": str(new_uuid)}), 201


@users_bp.route("/login/", methods=["POST"])
@swag_from(
    {
        "tags": ["Users"],
        "summary": "Log in a user",
        "description": "Verify email and password, and return the user's UUID on success.",
        "parameters": [
            {
                "name": "body",
                "in": "body",
                "required": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "email": {
                            "type": "string",
                            "example": "johndoe@example.com",
                            "required": True,
                        },
                        "password": {
                            "type": "string",
                            "example": "securepassword123",
                            "required": True,
                        },
                    },
                },
            }
        ],
        "responses": {
            "200": {
                "description": "Login successful",
                "schema": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "example": "success"},
                        "id": {"type": "string", "format": "uuid"},
                    },
                },
            },
            "400": {
                "description": "Missing email or password",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string", "example": "Email is required"}
                    },
                },
            },
            "401": {
                "description": "Invalid credentials",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {
                            "type": "string",
                            "example": "Invalid email or password",
                        }
                    },
                },
            },
            "500": {
                "description": "Server error",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string", "example": "Database error"}
                    },
                },
            },
        },
    }
)
def login_user():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT uuid, password FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        # If user not found or password does not match
        if not row or not check_password_hash(row[1], password):
            raise Unauthorized("Invalid email or password")

        user_uuid = row[0]
        return jsonify({"status": "success", "id": str(user_uuid)}), 200

    except Unauthorized as e:
        # 401 on bad credentials
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        # catch-all for unexpected errors
        return jsonify({"error": f"Server error: {e}"}), 500
