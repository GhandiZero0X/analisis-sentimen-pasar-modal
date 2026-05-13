# routes/routes.py
from flask import Blueprint
from controller.algoritmaController import (
    index,
    get_dashboard_data,
    get_trend_data,
    get_saham_detail,
    upload_csv,
)

routes_bp = Blueprint("routes", __name__)

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