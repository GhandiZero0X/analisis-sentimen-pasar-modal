import os
import sys
from flask import Flask
from flask_session import Session
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from routes.routes import routes_bp


def create_app():
    app = Flask(__name__)
    app.secret_key = "sentimen-saham-secret-key"

    # ── Server-side session ────────────────────────────────
    session_dir = os.path.join(BASE_DIR, "data", "flask_sessions")
    os.makedirs(session_dir, exist_ok=True)

    app.config["SESSION_TYPE"]      = "filesystem"
    app.config["SESSION_FILE_DIR"]  = session_dir
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"]= True

    Session(app)
    # ──────────────────────────────────────────────────────

    app.register_blueprint(routes_bp)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, use_reloader=False)