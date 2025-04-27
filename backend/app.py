from flask import Flask
from flask_cors import CORS
from routes.events import events_bp
from routes.users import users_bp
from routes.forums import forums_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(events_bp)
app.register_blueprint(users_bp)
app.register_blueprint(forums_bp)

def get_conn():
    """Open a new psycopg2 connection and register the vector type."""
    conn = psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB"))
    register_vector(conn)
    return conn

# Register blueprints
app.register_blueprint(events_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(forums_bp, url_prefix='/api')

# --- Test endpoints for recommendation functions ---
@app.route('/api/test/user/<uuid:user_uuid>/recommendations', methods=['GET'])
def test_user_recommendations(user_uuid):
    """Call the recommend_events_for_user DB function and return JSON."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM recommend_events_for_user(%s, %s);", (str(user_uuid), 10))
    recs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(recs)

@app.route('/api/test/tags/recommendations', methods=['GET'])
def test_tag_recommendations():
    """Call the recommend_events_by_tags DB function with ?tags=...&limit=..."""
    tags = request.args.getlist('tags')
    limit = request.args.get('limit', default=10, type=int)
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM recommend_events_by_tags(%s, %s);", (tags, limit))
    recs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(recs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
