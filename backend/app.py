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
from routes.events import events_bp

app = Flask(__name__)
CORS(app)

if events_bp is None:
    print("pls ")
# Initialize Swagger
swagger = Swagger(app)

# Register blueprints
app.register_blueprint(events_bp, url_prefix='/api/events')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(forums_bp, url_prefix='/api/forums')

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
