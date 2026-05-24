# controller/dashboardController.py
from flask import render_template

def dashboard_get():
    return render_template(
        "pages/dashboard.html",
        active_menu="dashboard",
        active_page="dashboard"
    )
