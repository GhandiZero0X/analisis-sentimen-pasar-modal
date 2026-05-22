# controller/authController.py
from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash

# Halaman login admin
def login_get():
    return render_template("login.html")

def register_get():
    return render_template("register.html")