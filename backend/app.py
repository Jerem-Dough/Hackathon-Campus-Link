from flask import Flask
from routes.events import events_bp
from routes.users import users_bp
from routes.forums import forums_bp

app = Flask(__name__)

# Register blueprints
app.register_blueprint(events_bp)
app.register_blueprint(users_bp)
app.register_blueprint(forums_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
