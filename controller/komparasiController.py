# controller/komparasiController.py
from flask import render_template

def komparasi_get():
    return render_template(
        "pages/comparison-model.html",
        active_menu="komparasi",
        active_page="komparasi"
    )