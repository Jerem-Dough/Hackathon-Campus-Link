from flask import Blueprint, jsonify, request
from db import get_db_connection
import openai
from flasgger import swag_from
from dotenv import load_dotenv

load_dotenv()


def create_embedding(text) -> list[float]:

    response = openai.embeddings.create(input=text, model="text-embedding-3-small")
    # print(response)
    embedding = response.data[0].embedding
    return embedding


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
                        "interest": {
                            "type": "array",
                            "items": {"type": "string"},
                            "example": ["AI", "Machine Learning"],
                        },
                        "major": {"type": "string", "example": "Computer Science"},
                        "campus": {"type": "string", "example": "University of Denver"},
                        "organization_id": {"type": "string", "example": "AI Society"},
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
                        "error": {"type": "string", "example": "Name is required"}
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
                        }
                    },
                },
            },
        },
    }
)
def add_user():
    try:
        data = request.get_json()

        # Extract data from request body
        name = data.get("name")
        interest = data.get("interest", [])  # Array of interests
        major = data.get("major")  # Single major as text
        campus = data.get("campus")  # Campus as text
        organization_name = data.get(
            "organization_id"
        )  # This will now receive organization name

        # Validate required fields
        if not name:
            return jsonify({"error": "Name is required"}), 400

        # Validate interest is an array
        if not isinstance(interest, list):
            return jsonify({"error": "Interest must be an array"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # First, look up organization_id by title
        org_query = "SELECT id FROM organization WHERE title = %s;"
        cursor.execute(org_query, (organization_name,))
        org_result = cursor.fetchone()

        if not org_result and organization_name:
            return (
                jsonify({"error": f"Organization '{organization_name}' not found"}),
                400,
            )

        organization_id = org_result[0] if org_result else None

        # Create embedding from user data
        embedding_text = f"{name} {' '.join(interest)} {major} {campus}"
        embedding = str(create_embedding(embedding_text))

        # Insert new user with all fields including embedding
        query = """
            INSERT INTO users (name, interest, major, campus, organization_id, embedding)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING uuid, name, interest, major, campus, organization_id, embedding;
        """

        cursor.execute(
            query, (name, interest, major, campus, organization_id, embedding)
        )

        # Get the created user
        new_user = cursor.fetchone()
        conn.commit()

        # Format response with success status and user ID
        user_response = {"status": "success", "id": str(new_user[0])}

        cursor.close()
        conn.close()

        return jsonify(user_response), 201

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


## rout to get user info by uuid
@users_bp.route("/<uuid:user_uuid>", methods=["GET"])
@swag_from(
    {
        "tags": ["Users"],
        "summary": "Get user by UUID",
        "description": "Retrieve user information by UUID",
        "parameters": [
            {
                "name": "user_uuid",
                "in": "path",
                "type": "string",
                "required": True,
                "description": "UUID of the user",
                "format": "uuid",
            }
        ],
        "responses": {
            "200": {
                "description": "User found",
                "schema": {
                    "type": "object",
                    "properties": {
                        "uuid": {
                            "type": "string",
                            "example": "123e4567-e89b-12d3-a456-426614174000",
                        },
                        "name": {"type": "string", "example": "John Doe"},
                        "interest": {
                            "type": "array",
                            "items": {"type": "string"},
                            "example": ["AI", "Machine Learning"],
                        },
                        "major": {"type": "string", "example": "Computer Science"},
                        "campus": {"type": "string", "example": "University of Denver"},
                        "organization_id": {"type": "string", "example": "org_123"},
                    },
                },
            },
            "404": {
                "description": "User not found",
                "schema": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string", "example": "User not found"}
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
def get_user(user_uuid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch user by UUID
        query = "SELECT * FROM users WHERE uuid = %s;"
        cursor.execute(query, (str(user_uuid),))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "uuid": str(user[0]),
            "name": user[1],
            "interest": user[2],
            "major": user[3],
            "campus": user[4],
            "organization_id": user[5],
        }

        cursor.close()
        conn.close()

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
