# controller/modelController.py
from flask import render_template

def modelDL_get():
    return render_template(
        "pages/modelDL.html",
        active_menu="model",
        active_page="modelDL"
    )

def modelML_get():
    return render_template(
        "pages/modelML.html",
        active_menu="model",
        active_page="modelML"
    )