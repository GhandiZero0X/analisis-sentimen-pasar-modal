# routes/routes.py
import os
from flask import send_from_directory, current_app
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
    register_get,
)
from controller.dashboardController import dashboard_get
from controller.datasetController import (
    before_get,
    after_get,
    covid_get,
    all_period_get,
)
from controller.modelConteoller import (
    modelDL_get,
    modelML_get,
)
from controller.komparasiController import komparasi_get
from controller.accountController import (
    list_accounts_get,
    edit_account_get,
    add_account_get,
)
from controller.profileController import profile_get

routes_bp = Blueprint("routes", __name__)

@routes_bp.route("/data/<path:filename>")
def data_file(filename):
    data_dir = os.path.join(current_app.root_path, "data")
    return send_from_directory(data_dir, filename)

# Autentikasi admin
routes_bp.add_url_rule("/admin/login", view_func=login_get, methods=["GET"])
routes_bp.add_url_rule("/admin/register", view_func=register_get, methods=["GET"])

# Halaman Dashboard admin
routes_bp.add_url_rule("/admin/dashboard", view_func=dashboard_get, methods=["GET"])

# Halaman dataset
routes_bp.add_url_rule("/admin/dataset/before-covid", view_func=before_get, methods=["GET"])
routes_bp.add_url_rule("/admin/dataset/after-covid", view_func=after_get, methods=["GET"])
routes_bp.add_url_rule("/admin/dataset/covid", view_func=covid_get, methods=["GET"])
routes_bp.add_url_rule("/admin/dataset/all-periods", view_func=all_period_get, methods=["GET"])

# Halaman model (ML & DL)
routes_bp.add_url_rule("/admin/model/dl", view_func=modelDL_get, methods=["GET"])
routes_bp.add_url_rule("/admin/model/ml", view_func=modelML_get, methods=["GET"])

# Halaman komparasi model
routes_bp.add_url_rule("/admin/komparasi", view_func=komparasi_get, methods=["GET"])

# Halaman list account
routes_bp.add_url_rule("/admin/accounts", view_func=list_accounts_get, methods=["GET"])
routes_bp.add_url_rule("/admin/accounts/edit/<int:account_id>", view_func=edit_account_get, methods=["GET"])
routes_bp.add_url_rule("/admin/accounts/add_account", view_func=add_account_get, methods=["GET"])

# Halaman profile
routes_bp.add_url_rule("/admin/profile", view_func=profile_get, methods=["GET"])

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