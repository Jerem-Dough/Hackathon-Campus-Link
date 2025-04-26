from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

# Database connection settings
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = os.getenv('POSTGRES_PORT', '5432')
DB_NAME = os.getenv('POSTGRES_DB', 'EXPOS_THANI_WEB')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASS = os.getenv('POSTGRES_PASSWORD', 'TEMP123')

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn

# ========== API ROUTES ==========

@app.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, title, description, event_date, location FROM events')
    events = cur.fetchall()
    cur.close()
    conn.close()

    events_list = []
    for event in events:
        events_list.append({
            'id': event[0],
            'title': event[1],
            'description': event[2],
            'event_date': event[3],
            'location': event[4]
        })

    return jsonify(events_list)

@app.route('/api/forums', methods=['GET'])
def get_forums():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, title, content, user_id, created_at FROM forums')
    forums = cur.fetchall()
    cur.close()
    conn.close()

    forums_list = []
    for forum in forums:
        forums_list.append({
            'id': forum[0],
            'title': forum[1],
            'content': forum[2],
            'user_id': str(forum[3]),
            'created_at': forum[4]
        })

    return jsonify(forums_list)

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, username, campus, created_at FROM accounts')
    accounts = cur.fetchall()
    cur.close()
    conn.close()

    accounts_list = []
    for account in accounts:
        accounts_list.append({
            'id': str(account[0]),
            'username': account[1],
            'campus': account[2],
            'created_at': account[3]
        })

    return jsonify(accounts_list)

# ========== MAIN ==========

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)