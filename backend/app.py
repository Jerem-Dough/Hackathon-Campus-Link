from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)

# Register blueprints
app.register_blueprint(events_bp)
app.register_blueprint(users_bp)
app.register_blueprint(forums_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
