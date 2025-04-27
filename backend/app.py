import os
import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request
from flask_cors import CORS
from pgvector.psycopg2 import register_vector
# from routes.routers import events_bp
from routes.users import users_bp
from routes.forums import forums_bp
from flasgger import Swagger

app = Flask(__name__)
CORS(app)

# Initialize Swagger
swagger = Swagger(app)

# Register blueprints
# app.register_blueprint(events_bp)
app.register_blueprint(users_bp)
app.register_blueprint(forums_bp)

# Hello World JSON endpoint
@app.route('/api/hello', methods=['GET'])
def hello_world():
    """
    A simple hello world endpoint
    ---
    responses:
      200:
        description: Returns a simple message
        schema:
          type: object
          properties:
            message:
              type: string
              example: Hello, World!
    """
    return jsonify({"message": "Hello, World!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
