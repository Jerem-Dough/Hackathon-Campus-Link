import os
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
from pgvector.psycopg2 import register_vector
from sentence_transformers import SentenceTransformer

search_bp = Blueprint('search', __name__, url_prefix='/api/search')

# Load the embedding model (e.g., SentenceTransformer)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
# we get a transfomrer to sue 

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn

@search_bp.route('/events', methods=['POST'])
def search_events_by_embedding():
    """
    POST /api/search/events
    Body: { "text": "example input", "limit": 5 }
    Searches for events similar to the input text based on embeddings.
    """
    data = request.get_json()
    text_input = data.get('text', '')
    limit = data.get('limit', 5)

    if not text_input:
        return jsonify({"error": "Text input is required"}), 400

    # Generate embedding for the input text
    input_embedding = embedding_model.encode(text_input).tolist()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Perform the nearest-neighbor search using cosine similarity
    cur.execute("""
        SELECT id, title, description, location, date, 
               1 - (embedding <=> %s::vector) AS similarity
        FROM events
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
    """, (input_embedding, input_embedding, limit))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Convert any date/time fields to ISO format
    results = []
    for row in rows:
        for key, val in row.items():
            if hasattr(val, 'isoformat'):
                row[key] = val.isoformat()
        results.append(row)

    return jsonify(results)
