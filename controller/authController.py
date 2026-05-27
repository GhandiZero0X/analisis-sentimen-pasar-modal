# controller/authController.py
import os
import csv
import uuid
from pathlib import Path
from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from utils.jwt_utils import create_token, decode_token

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR   = Path(__file__).resolve().parents[1]
USERS_CSV  = BASE_DIR / "data" / "users.csv"

# Kolom CSV
CSV_COLUMNS = [
    "id", "photo_profile", "full_name", "company",
    "phone_number", "email", "password", "country",
    "status_approval", "role",
]

# ── Default values untuk field yang tidak diisi user ─────────
DEFAULT_PHOTO   = "avatar_default.jpg"
DEFAULT_COMPANY = "StockSenseID"
DEFAULT_COUNTRY = "Indonesia"
DEFAULT_STATUS  = "0"   # 0 = pending, 1 = approved
DEFAULT_ROLE    = "admin"


# ══════════════════════════════════════════════════════════════
#  HELPER — CSV
# ══════════════════════════════════════════════════════════════
def _ensure_csv():
    """Buat file CSV beserta header jika belum ada."""
    USERS_CSV.parent.mkdir(parents=True, exist_ok=True)
    if not USERS_CSV.exists():
        with open(USERS_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
            writer.writeheader()


def _read_all_users() -> list[dict]:
    """Baca semua user dari CSV."""
    _ensure_csv()
    with open(USERS_CSV, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _write_all_users(users: list[dict]):
    """Tulis ulang semua user ke CSV."""
    _ensure_csv()
    with open(USERS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(users)


def _append_user(user: dict):
    """Tambahkan satu user baru ke CSV."""
    _ensure_csv()
    with open(USERS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writerow(user)


def _find_user_by_email(email: str) -> dict | None:
    """Cari user berdasarkan email (case-insensitive)."""
    for user in _read_all_users():
        if user.get("email", "").lower() == email.lower():
            return user
    return None


def _find_user_by_id(user_id: str) -> dict | None:
    """Cari user berdasarkan id."""
    for user in _read_all_users():
        if user.get("id") == str(user_id):
            return user
    return None


def _generate_id() -> str:
    """Generate ID unik numerik berdasarkan jumlah user + 1."""
    users = _read_all_users()
    if not users:
        return "1"
    # Ambil ID terbesar lalu +1 untuk menghindari collision
    ids = []
    for u in users:
        try:
            ids.append(int(u.get("id", 0)))
        except ValueError:
            pass
    return str(max(ids) + 1) if ids else "1"


# ══════════════════════════════════════════════════════════════
#  REGISTER
# ══════════════════════════════════════════════════════════════
def register_get():
    """GET /admin/register — tampilkan halaman register."""
    return render_template("pages/register.html")


def register_post():
    """
    POST /admin/register — proses pendaftaran akun baru.

    Field dari form:
        name            → full_name
        phone           → phone_number
        email           → email
        password        → password (di-hash)
        confirm_password→ validasi saja, tidak disimpan

    Field default (tidak dari form):
        photo_profile   = avatar_default.jpg
        company         = StockSenseID
        country         = (kosong)
        status_approval = 0  (pending, menunggu persetujuan superadmin)
        role            = admin
    """
    full_name        = request.form.get("name", "").strip()
    phone_number     = request.form.get("phone", "").strip()
    email            = request.form.get("email", "").strip().lower()
    password         = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")

    # ── Validasi server-side ──────────────────────────────
    errors = []

    if not full_name or len(full_name) < 3:
        errors.append("Nama lengkap minimal 3 karakter.")

    if not phone_number:
        errors.append("Nomor telepon wajib diisi.")

    if not email or "@" not in email:
        errors.append("Email tidak valid.")

    if not password or len(password) < 8:
        errors.append("Password minimal 8 karakter.")

    if password != confirm_password:
        errors.append("Password dan konfirmasi password tidak cocok.")

    if _find_user_by_email(email):
        errors.append("Email sudah terdaftar. Silakan gunakan email lain.")

    if errors:
        for err in errors:
            flash(err, "danger")
        return render_template(
            "pages/register.html",
            form_data={
                "name" : full_name,
                "phone": phone_number,
                "email": email,
            }
        )

    # ── Simpan user baru ──────────────────────────────────
    new_user = {
        "id"             : _generate_id(),
        "photo_profile"  : DEFAULT_PHOTO,
        "full_name"      : full_name,
        "company"        : DEFAULT_COMPANY,
        "phone_number"   : phone_number,
        "email"          : email,
        "password"       : generate_password_hash(password),
        "country"        : DEFAULT_COUNTRY,
        "status_approval": DEFAULT_STATUS,
        "role"           : DEFAULT_ROLE,
    }

    _append_user(new_user)
    print(f"✅ User baru terdaftar: {email} (id={new_user['id']}, role={DEFAULT_ROLE})")

    flash(
        "Akun berhasil dibuat! Menunggu persetujuan dari superadmin sebelum dapat login.",
        "success"
    )
    return redirect(url_for("routes.login_get"))


# ══════════════════════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════════════════════
def login_get():
    """GET /admin/login — tampilkan halaman login."""
    # Jika sudah login, redirect ke dashboard
    token = session.get("token")
    if token:
        try:
            payload = decode_token(token)
            if payload:
                return redirect(url_for("routes.dashboard_get"))
        except Exception:
            session.clear()
    return render_template("pages/login.html")


def login_post():
    """
    POST /admin/login — proses login dengan JWT.

    Pembagian hak akses:
        superadmin → akses penuh (termasuk manajemen akun)
        admin      → akses dashboard, analisis, data (status harus approved)
    """
    email    = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")

    if not email or not password:
        flash("Email dan password wajib diisi.", "danger")
        return render_template("pages/login.html", form_data={"email": email})

    user = _find_user_by_email(email)

    # ── Cek user dan password ─────────────────────────────
    if not user or not check_password_hash(user.get("password", ""), password):
        flash("Email atau password salah.", "danger")
        return render_template("pages/login.html", form_data={"email": email})

    # ── Cek status approval (hanya untuk role admin) ──────
    role   = user.get("role", "admin")
    status = user.get("status_approval", "0")

    if role == "admin" and str(status) != "1":
        flash(
            "Akun Anda belum disetujui oleh superadmin. Silakan tunggu konfirmasi.",
            "warning"
        )
        return render_template("pages/login.html", form_data={"email": email})

    # ── Buat JWT token ────────────────────────────────────
    token_payload = {
        "id"   : user["id"],
        "email": user["email"],
        "role" : role,
        "name" : user.get("full_name", ""),
    }
    token = create_token(token_payload)

    # Simpan token di session
    session["token"]      = token
    session["user_id"]    = user["id"]
    session["user_email"] = user["email"]
    session["user_role"]  = role
    session["user_name"]  = user.get("full_name", "")
    session["user_photo"] = user.get("photo_profile", DEFAULT_PHOTO)

    print(f"✅ Login berhasil: {email} (role={role})")
    return redirect(url_for("routes.dashboard_get"))


# ══════════════════════════════════════════════════════════════
#  LOGOUT
# ══════════════════════════════════════════════════════════════
def logout():
    """POST /admin/logout — hapus session dan redirect ke login."""
    session.clear()
    flash("Anda telah berhasil logout.", "success")
    return redirect(url_for("routes.login_get"))