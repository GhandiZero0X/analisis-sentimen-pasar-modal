# routes/routes.py
from flask import Blueprint
from controller.algoritmaController import (
    index,
    get_dashboard_data,
    get_trend_data,
    get_saham_detail,
    upload_csv,
)
from controller.authController import (
    login_get,
    login_get,
    login_post,
    logout,
    register_get,
    register_post
)

routes_bp = Blueprint("routes", __name__)

# Autentikasi admin
routes_bp.add_url_rule("/admin/login", view_func=login_get, methods=["GET"])
# routes_bp.add_url_rule("/admin/login", view_func=login_post, methods=["POST"])
# routes_bp.add_url_rule("/admin/logout", view_func=logout, methods=["GET"])
routes_bp.add_url_rule("/admin/register", view_func=register_get, methods=["GET"])
# routes_bp.add_url_rule("/admin/register", view_func=register_post, methods=["POST"])

# Halaman Dashboard admin
routes_bp.add_url_rule("/admin/dashboard", view_func=index, methods=["GET"])

# ── Halaman utama ──────────────────────────────────────────
routes_bp.add_url_rule("/", view_func=index, methods=["GET"])

# ── API endpoints (JSON) ───────────────────────────────────
# Data ringkasan untuk dashboard utama
routes_bp.add_url_rule(
    "/api/dashboard",
    view_func=get_dashboard_data,
    methods=["GET"],
)

# Data tren sentimen (param: saham, periode, period_type)
routes_bp.add_url_rule(
    "/api/trend",
    view_func=get_trend_data,
    methods=["GET"],
)

# Detail satu saham (param: saham, periode)
routes_bp.add_url_rule(
    "/api/saham",
    view_func=get_saham_detail,
    methods=["GET"],
)

# Upload CSV untuk analisis
routes_bp.add_url_rule(
    "/api/upload",
    view_func=upload_csv,
    methods=["POST"],
)