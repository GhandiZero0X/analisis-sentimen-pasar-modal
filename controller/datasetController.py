# controller/dashboardController.py
from flask import render_template

def before_get():
    return render_template(
        "pages/before-covid.html",
        active_menu="dataset",
        active_page="before-covid"
    )

def covid_get():
    return render_template(
        "pages/covid.html",
        active_menu="dataset",
        active_page="covid"
    )

def after_get():
    return render_template(
        "pages/after-covid.html",
        active_menu="dataset",
        active_page="after-covid"
    )

def all_period_get():
    return render_template(
        "pages/all-periods.html",
        active_menu="dataset",
        active_page="all-periods"
    )