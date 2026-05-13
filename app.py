# app.py
from flask import Flask
from routes.routes import routes_bp

app = Flask(__name__)
app.secret_key = "sentimen-saham-secret-key"

# Daftarkan blueprint
app.register_blueprint(routes_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)