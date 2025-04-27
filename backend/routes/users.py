from flask import Blueprint, jsonify, request
from db import get_db_connection

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/create_user/', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        
        # Extract data from request body
        name = data.get('name')
        interest = data.get('interest', [])  # Default empty list if not provided
        major = data.get('major')
        campus = data.get('campus')
        organization_id = data.get('organization_id')

        # Validate required fields
        if not name:
            return jsonify({"error": "Name is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert new user with auto-generated UUID
        query = """
            INSERT INTO users (name, interest, major, campus, organization_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING uuid, name, interest, major, campus;
        """
        
        cursor.execute(query, (
            name,
            interest,
            major,
            campus,
            organization_id
        ))

        # Get the created user
        new_user = cursor.fetchone()
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"status": "successful"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

## rout to get user info by uuid
@users_bp.route('/<uuid:user_uuid>', methods=['GET'])
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
            "organization_id": user[5]
        }

        cursor.close()
        conn.close()

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500