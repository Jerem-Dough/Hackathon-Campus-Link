from flask import Blueprint, jsonify
from db import get_db_connection
import os
import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request
# from werkzeug.routing import UUIDConverter
from pgvector.psycopg2 import register_vector
import openai
def get_db_connection():
    conn = psycopg2.connect(
        os.getenv(
            'DATABASE_URL',
            'postgresql://postgres:TEMP123@db:5432/EXPOS_THANI_WEB'
        )
    )
    register_vector(conn)
    return conn

events_bp = Blueprint('events', __name__, url_prefix='/api')

# Register UUIDConverter for the app
# def register_uuid_converter(app):
#     app.url_map.converters['uuid'] = UUIDConverter



# INSERTION FUNCTIONALITIES: 

@events_bp.route('/events/add',methods=['POST'])
def insert_event(entryjson):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for row in entryjson:
        # Extract values from the JSON row
        id = row.get('id')
        title = row.get('title')
        date = row.get('date')
        location = row.get('location')
        image = row.get('image', '/images/default.png')  # Default image if not provided
        description = row.get('description')
        tags = row.get('tags', [])
        tags_text = " ".join(tags)  # Combine tags into a single string
        embedding = get_embedding_from_gpt(tags_text)  # Generate embedding based on tags

        # add into the events table
        cursor.execute("""
            INSERT INTO events (id, title, date, location, image, description, tags, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (id, title, date, location, image, description, tags, embedding))
    
    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route('/events/remove', methods=['DELETE'])

def remove_event(entryjson):
    conn = get_db_connection()
    cursor = conn.cursor()

    for row in entryjson:
        # Extract the event ID from the JSON row
        id = row.get('id')

        # Remove the event from the events table
        cursor.execute("""
            DELETE FROM events
            WHERE id = %s;
        """, (id,))

    conn.commit()
    cursor.close()
    conn.close()

@events_bp.route("/events/org/add",METHODS=['POST'])
def insert_organization(entryjson):
    conn = get_db_connection()
    cursor = conn.cursor()

    for row in entryjson:
        # Extract values from the JSON row
        id = row.get('id')
        title = row.get('title')
        location = row.get('location')
        image = row.get('image', '/images/default.png')  # Default image if not provided
        description = row.get('description')
        tags = row.get('tags', [])
        tags_text = " ".join(tags)  # Combine tags into a single string
        embedding = get_embedding_from_gpt(tags_text)  # Generate embedding based on tags

        # Add into the organization table
        cursor.execute("""
            INSERT INTO organization (id, title, location, image, description, tags, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (id, title, location, image, description, tags, embedding))
    conn.commit()
    cursor.close()
    conn.close()


@events_bp.route("/events/org/remove", methods=['DELETE'])
def remove_organization(entryjson):
    conn = get_db_connection()
    cursor = conn.cursor()

    for row in entryjson:
        # Extract the organization ID from the JSON row
        id = row.get('id')

        # Remove the organization from the organization table
        cursor.execute("""
            DELETE FROM organization
            WHERE id = %s;
        """, (id,))

    conn.commit()
    cursor.close()
    conn.close()



# SEARCHING FUNCTIONALITIES:::


@events_bp.route('/events', methods=['GET'])
def get_all_events():
    # get all events that are new 
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, event_date, location, description FROM events WHERE event_date > Now();")
    rows = cursor.fetchall()
    conn.close()

    events = []
    for row in rows:
        events.append({
            "id": row[0],
            "title": row[1],
            "date": row[2].strftime('%Y-%m-%d'),
            "location": row[3],
            "image": "/images/default.png",
            "description": row[4]
        })

    return jsonify(events)
########## SEARCH EVENTS ROUTER: 

# events_bp = Blueprint('events', __name__, url_prefix='/api')

# Load the embedding model
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_embedding_from_gpt(text):
# def create_embedding(text) -> list[float]:


    response = openai.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    print(response)
    embedding = response.data[0].embedding
    return embedding
  


# search events by embedding
@events_bp.route('/events/search/embed', methods=['POST'])
def search_events_by_embedding():
    """
    POST /api/events/embeddings/
    Body: { "text": "example input", "limit": 5 }
    Searches for events similar to the input text based on embeddings.
    """
    data = request.get_json()
    text_input = data.get('text', '')
    limit = data.get('limit', 5)

    if not text_input:
        return jsonify({"error": "Text input is required"}), 400

    # get embedding for the input text using GPT
    input_embedding = get_embedding_from_gpt(text_input)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Perform the nearest-neighbor search using cosine similarity
    cur.execute("""
        SELECT id, title, description, location, event_date AS date, 
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
        row['date'] = row['date'].isoformat() if row['date'] else None
        results.append(row)

    return jsonify(results)

######## USERS ROUTERS: 

### ADVANCED EMBEDDING SEARCHs

@events_bp.route('/events/orgs/recommended/<uuid:user_uuid>', methods=['GET'])
def recommend_organizations_for_user(user_uuid):
    """
    GET /api/organizations/orgs/recommended/<user_uuid>?limit=5
    Calls the recommend_organizations(user_uuid, limit) SQL function
    and returns a JSON array of organization records.
    """
    # Optional query parameter to override limit
    limit = request.args.get('limit', default=5, type=int)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Invoke the recommendation function
    cur.execute("""
        SELECT *
        FROM recommend_organizations(%s, %s);
    """, (str(user_uuid), limit))
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



@events_bp.route('/events/recommended<uuid:user_uuid>', methods=['GET'])
def get_user_recommended_events(user_uuid):
    """
    GET /api/events/recommended/<user_uuid>?limit=10
    """
    # allow an optional ?limit= parameter (default to 10)
    limit = request.args.get('limit', default=10, type=int)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch the user's embedding data
    cur.execute("""
        SELECT embedding
        FROM users
        WHERE uuid = %s;
    """, (str(user_uuid),))
    user_embedding = cur.fetchone()

    # If no embedding is found for the user, return an empty list
    if not user_embedding or user_embedding['embedding'] is None:
        cur.close()
        conn.close()
        return jsonify([])

    # Call the SQL function with the user's embedding and limit
    cur.execute("""
        SELECT
          id,
          title,
          date,
          location,
          image,
          description
        FROM recommend_events_for_user(%s, %s);
    """, (user_uuid, limit))

    rows = cur.fetchall()
    cur.close()
    conn.close()
    # psycopg2.RealDictCursor already gives you dict-like rows:
    #   { 'id': ..., 'title': ..., 'date': dateobj, ... }
    # Just need to convert date to ISO format.
    events = []
    for row in rows:
        events.append({
            'id':          row['id'],
            'title':       row['title'],
            'date':        row['date'].isoformat(),
            'location':    row['location'],
            'image':       row['image'],
            'description': row['description'],
        })

    return jsonify(events)


@events_bp.route('/events/tags/<uuid:user_uuid>', methods=['GET'])
def recommend_events_by_user_tags(user_uuid):
    """
    GET /api/users/<user_uuid>/events/recommend-by-tags?limit=10
    1) Grab all distinct tags from events the user is in.
    2) Call recommend_events_by_tags(tag_list, limit).
    3) Return JSON of recommended events.
    """
    limit = request.args.get('limit', default=10, type=int)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # 1) Fetch all tags from events this user is attending
    cur.execute("""
        SELECT DISTINCT unnest(e.tags) AS tag
        FROM events e
        JOIN user_events ue
          ON ue.event_id = e.id
        WHERE ue.user_uuid = %s;
    """, (str(user_uuid),))

    tags = [row['tag'] for row in cur.fetchall()]
    # If they’re not in any events yet, just return an empty list
    if not tags:
        cur.close()
        conn.close()
        return jsonify([])

    # 2) Call the recommendation function
    cur.execute("""
        SELECT
          id,
          title,
          date,
          location,
          image,
          description
        FROM recommend_events_by_tags(%s::text[], %s);
    """, (tags, limit))

    recs = cur.fetchall()
    cur.close()
    conn.close()

    # 3) Format date → ISO and return
    for ev in recs:
        ev['date'] = ev['date'].isoformat()

    return jsonify(recs)


### get forums routes: se;perate 