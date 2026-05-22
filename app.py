# app.py
import os
import sys

from flask import Flask
from routes.routes import routes_bp

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_app():
    app = Flask(__name__)
    app.secret_key = "sentimen-saham-secret-key"

    # Daftarkan blueprint
    app.register_blueprint(routes_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
    app.run(host="0.0.0.0", port=5000, debug=True)