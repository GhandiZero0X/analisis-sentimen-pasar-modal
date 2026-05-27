# controller/accountController.py
import os
import math
import csv
import shutil
import hashlib
from flask import render_template, request, redirect, url_for, flash, current_app
from werkzeug.utils import secure_filename

CSV_PATH = os.path.join("data", "users.csv")
PER_PAGE = 50
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


# ── Helper: baca semua user dari CSV ──────────────────────────────────────────
def _read_users() -> list[dict]:
    path = os.path.join(current_app.root_path, CSV_PATH)
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ── Helper: tulis semua user ke CSV ──────────────────────────────────────────
def _write_users(users: list[dict]):
    path = os.path.join(current_app.root_path, CSV_PATH)
    if not users:
        return
    fieldnames = ["id", "photo_profile", "full_name", "company",
                  "phone_number", "email", "password", "country",
                  "status_approval", "role"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(users)


# ── Helper: next id ───────────────────────────────────────────────────────────
def _next_id(users: list[dict]) -> int:
    if not users:
        return 1
    return max(int(u["id"]) for u in users) + 1


# ── Helper: hash password ─────────────────────────────────────────────────────
def _hash_password(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()


# ── Helper: allowed file ──────────────────────────────────────────────────────
def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ═════════════════════════════════════════════════════════════════════════════
# LIST ACCOUNTS
# ═════════════════════════════════════════════════════════════════════════════
def list_accounts_get():
    users      = _read_users()
    page       = int(request.args.get("page", 1))
    total      = len(users)
    total_pages = max(1, math.ceil(total / PER_PAGE))
    page       = max(1, min(page, total_pages))

    start = (page - 1) * PER_PAGE
    end   = start + PER_PAGE
    page_users = users[start:end]

    return render_template(
        "pages/list-account.html",
        active_menu   = "account",
        active_page   = "list-accounts",
        users         = page_users,
        page          = page,
        total_pages   = total_pages,
        total         = total,
        start_row     = start + 1,
        end_row       = min(end, total),
    )


# ═════════════════════════════════════════════════════════════════════════════
# EDIT ACCOUNT  (GET + POST)
# ═════════════════════════════════════════════════════════════════════════════
def edit_account_get(account_id: int):
    users = _read_users()
    user  = next((u for u in users if int(u["id"]) == account_id), None)
    if not user:
        flash("Akun tidak ditemukan.", "danger")
        return redirect(url_for("routes.list_accounts_get"))

    return render_template(
        "pages/edit-account.html",
        account_id  = account_id,
        user        = user,
        active_menu = "account",
        active_page = "list-accounts",
    )


def edit_account_post(account_id: int):
    users = _read_users()
    idx   = next((i for i, u in enumerate(users) if int(u["id"]) == account_id), None)
    if idx is None:
        flash("Akun tidak ditemukan.", "danger")
        return redirect(url_for("routes.list_accounts_get"))

    user = users[idx]
    action = request.form.get("action", "profile")

    # ── Tab: Edit Profil ──────────────────────────────────────────────────────
    if action == "profile":
        user["full_name"]       = request.form.get("fullName",    user["full_name"])
        user["company"]         = request.form.get("company",     user["company"])
        user["role"]            = request.form.get("role",        user["role"])
        user["country"]         = request.form.get("country",     user["country"])
        user["phone_number"]    = request.form.get("phone",       user["phone_number"])
        user["email"]           = request.form.get("email",       user["email"])
        user["status_approval"] = request.form.get("status_akun", user["status_approval"])

        # Upload foto profil
        file = request.files.get("profileImage")
        if file and file.filename and _allowed_file(file.filename):
            ext      = file.filename.rsplit(".", 1)[1].lower()
            filename = f"avatar_{account_id}.{ext}"
            save_dir = os.path.join(current_app.root_path, "static", "img")
            os.makedirs(save_dir, exist_ok=True)
            file.save(os.path.join(save_dir, filename))
            user["photo_profile"] = filename

        flash("Profil berhasil diperbarui.", "success")

    # ── Tab: Ganti Password ───────────────────────────────────────────────────
    elif action == "password":
        current_pw  = request.form.get("currentPassword", "")
        new_pw      = request.form.get("newPassword", "")
        renew_pw    = request.form.get("renewPassword", "")

        if _hash_password(current_pw) != user["password"]:
            flash("Password saat ini salah.", "danger")
            return redirect(url_for("routes.edit_account_get", account_id=account_id))

        if new_pw != renew_pw:
            flash("Password baru tidak cocok.", "danger")
            return redirect(url_for("routes.edit_account_get", account_id=account_id))

        if len(new_pw) < 6:
            flash("Password baru minimal 6 karakter.", "danger")
            return redirect(url_for("routes.edit_account_get", account_id=account_id))

        user["password"] = _hash_password(new_pw)
        flash("Password berhasil diubah.", "success")

    users[idx] = user
    _write_users(users)
    return redirect(url_for("routes.edit_account_get", account_id=account_id))


# ═════════════════════════════════════════════════════════════════════════════
# ADD ACCOUNT  (GET + POST)
# ═════════════════════════════════════════════════════════════════════════════
def add_account_get():
    return render_template(
        "pages/list-account_add.html",
        active_menu = "account",
        active_page = "list-accounts",
    )


def add_account_post():
    users = _read_users()

    full_name    = request.form.get("fullName", "").strip()
    email        = request.form.get("email", "").strip()
    phone        = request.form.get("phone", "").strip()
    company      = request.form.get("company", "StockSenseID").strip()
    role         = request.form.get("role", "admin").strip()
    country      = request.form.get("country", "Indonesia").strip()
    password     = request.form.get("password", "").strip()
    re_password  = request.form.get("rePassword", "").strip()
    status       = request.form.get("status", "1")

    # Validasi
    if not full_name or not email or not password:
        flash("Full Name, Email, dan Password wajib diisi.", "danger")
        return redirect(url_for("routes.add_account_get"))

    if password != re_password:
        flash("Password tidak cocok.", "danger")
        return redirect(url_for("routes.add_account_get"))

    if len(password) < 6:
        flash("Password minimal 6 karakter.", "danger")
        return redirect(url_for("routes.add_account_get"))

    if any(u["email"] == email for u in users):
        flash("Email sudah terdaftar.", "danger")
        return redirect(url_for("routes.add_account_get"))

    new_id = _next_id(users)

    # Upload foto profil (opsional)
    photo_profile = f"avatar_default.jpg"  # default
    file = request.files.get("profileImage")
    if file and file.filename and _allowed_file(file.filename):
        ext      = file.filename.rsplit(".", 1)[1].lower()
        filename = f"avatar_{new_id}.{ext}"
        save_dir = os.path.join(current_app.root_path, "static", "img")
        os.makedirs(save_dir, exist_ok=True)
        file.save(os.path.join(save_dir, filename))
        photo_profile = filename

    new_user = {
        "id":              str(new_id),
        "photo_profile":   photo_profile,
        "full_name":       full_name,
        "company":         company,
        "phone_number":    phone,
        "email":           email,
        "password":        _hash_password(password),
        "country":         country,
        "status_approval": status,
        "role":            role,
    }
    users.append(new_user)
    _write_users(users)

    flash(f"Akun '{full_name}' berhasil ditambahkan.", "success")
    return redirect(url_for("routes.list_accounts_get"))


# ═════════════════════════════════════════════════════════════════════════════
# DELETE ACCOUNT
# ═════════════════════════════════════════════════════════════════════════════
def delete_account_post(account_id: int):
    users = _read_users()
    before = len(users)
    users  = [u for u in users if int(u["id"]) != account_id]

    if len(users) == before:
        flash("Akun tidak ditemukan.", "danger")
    else:
        _write_users(users)
        flash("Akun berhasil dihapus.", "success")

    return redirect(url_for("routes.list_accounts_get"))