# controller/profileController.py
import csv
from pathlib import Path
from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash

# ══════════════════════════════════════════════════════════════
#  PATH
# ══════════════════════════════════════════════════════════════
BASE_DIR      = Path(__file__).resolve().parents[1]
USERS_CSV     = BASE_DIR / "data" / "users.csv"
UPLOAD_FOLDER = BASE_DIR / "static" / "img"

CSV_COLUMNS = [
    "id", "photo_profile", "full_name", "company",
    "phone_number", "email", "password", "country",
    "status_approval", "role",
]

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}


# ══════════════════════════════════════════════════════════════
#  HELPER — CSV
# ══════════════════════════════════════════════════════════════
def _read_all_users() -> list[dict]:
    if not USERS_CSV.exists():
        return []
    with open(USERS_CSV, "r", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _write_all_users(users: list[dict]):
    with open(USERS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(users)


def _find_user_by_id(user_id: str) -> dict | None:
    for u in _read_all_users():
        if str(u.get("id")) == str(user_id):
            return u
    return None


def _update_user(user_id: str, updated_fields: dict) -> bool:
    users = _read_all_users()
    found = False
    for u in users:
        if str(u.get("id")) == str(user_id):
            u.update(updated_fields)
            found = True
            break
    if found:
        _write_all_users(users)
    return found


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ══════════════════════════════════════════════════════════════
#  VIEW PROFILE
# ══════════════════════════════════════════════════════════════
def profile_get():
    """GET /admin/profile"""
    user_id = session.get("user_id")
    user    = _find_user_by_id(user_id)

    if not user:
        flash("Data profil tidak ditemukan.", "danger")
        return redirect(url_for("routes.dashboard_get"))

    return render_template(
        "pages/profile.html",
        user        = user,
        active_menu = "profile",
        active_page = "profile",
    )


# ══════════════════════════════════════════════════════════════
#  EDIT PROFILE
# ══════════════════════════════════════════════════════════════
def profile_edit_post():
    """POST /admin/profile/edit"""
    user_id = session.get("user_id")
    user    = _find_user_by_id(user_id)

    if not user:
        flash("Data profil tidak ditemukan.", "danger")
        return redirect(url_for("routes.profile_get"))

    full_name    = request.form.get("fullName", "").strip()
    company      = request.form.get("company", "").strip()
    country      = request.form.get("country", "").strip()
    phone_number = request.form.get("phone", "").strip()
    email        = request.form.get("email", "").strip().lower()

    # ── Validasi ──────────────────────────────────────────
    errors = []
    if not full_name or len(full_name) < 3:
        errors.append("Nama lengkap minimal 3 karakter.")
    if not email or "@" not in email:
        errors.append("Email tidak valid.")
    if not phone_number:
        errors.append("Nomor telepon wajib diisi.")

    # Cek email duplikat dengan user lain
    for u in _read_all_users():
        if u["email"].lower() == email and str(u["id"]) != str(user_id):
            errors.append("Email sudah digunakan akun lain.")
            break

    if errors:
        for err in errors:
            flash(err, "danger")
        return redirect(url_for("routes.profile_get"))

    # ── Handle upload foto profil ─────────────────────────
    photo_profile = user.get("photo_profile", "avatar_default.jpg")
    file = request.files.get("profileImage")
    if file and file.filename and _allowed_file(file.filename):
        ext       = file.filename.rsplit(".", 1)[1].lower()
        filename  = f"profile_{user_id}.{ext}"
        save_path = UPLOAD_FOLDER / filename
        UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        file.save(str(save_path))
        photo_profile = filename

    # ── Simpan ke CSV ──────────────────────────────────────
    _update_user(user_id, {
        "full_name"    : full_name,
        "company"      : company,
        "country"      : country,
        "phone_number" : phone_number,
        "email"        : email,
        "photo_profile": photo_profile,
    })

    # ── Refresh session ────────────────────────────────────
    session["user_name"]  = full_name
    session["user_email"] = email
    session["user_photo"] = photo_profile

    flash("Profil berhasil diperbarui.", "success")
    return redirect(url_for("routes.profile_get"))


# ══════════════════════════════════════════════════════════════
#  CHANGE PASSWORD
# ══════════════════════════════════════════════════════════════
def profile_change_password_post():
    """POST /admin/profile/change-password"""
    user_id = session.get("user_id")
    user    = _find_user_by_id(user_id)

    if not user:
        flash("Data profil tidak ditemukan.", "danger")
        return redirect(url_for("routes.profile_get"))

    current_password = request.form.get("currentPassword", "")
    new_password     = request.form.get("newPassword", "")
    renew_password   = request.form.get("renewPassword", "")

    # ── Validasi ──────────────────────────────────────────
    if not check_password_hash(user.get("password", ""), current_password):
        flash("Password saat ini tidak sesuai.", "danger")
        return redirect(url_for("routes.profile_get") + "#profile-change-password")

    if len(new_password) < 8:
        flash("Password baru minimal 8 karakter.", "danger")
        return redirect(url_for("routes.profile_get") + "#profile-change-password")

    if new_password != renew_password:
        flash("Konfirmasi password baru tidak cocok.", "danger")
        return redirect(url_for("routes.profile_get") + "#profile-change-password")

    if new_password == current_password:
        flash("Password baru tidak boleh sama dengan password lama.", "warning")
        return redirect(url_for("routes.profile_get") + "#profile-change-password")

    # ── Simpan password baru ───────────────────────────────
    _update_user(user_id, {"password": generate_password_hash(new_password)})

    flash("Password berhasil diubah. Silakan login ulang.", "success")
    session.clear()
    return redirect(url_for("routes.login_get"))