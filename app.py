import os
import sys
from flask import Flask

# pastikan root project masuk dulu ke path import
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from routes.routes import routes_bp


def create_app():
    app = Flask(__name__)
    app.secret_key = "sentimen-saham-secret-key"

    app.register_blueprint(routes_bp)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, use_reloader=False)