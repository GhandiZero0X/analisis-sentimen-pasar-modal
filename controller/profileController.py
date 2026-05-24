# controller/profileController.py
from flask import render_template

def profile_get():
    return render_template(
        "pages/profile.html",
        active_menu="profile",
        active_page="profile"
    )