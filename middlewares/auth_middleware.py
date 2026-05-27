# middlewares/auth_middlewares.py
from functools import wraps
from flask import request, session, redirect, url_for, flash
from utils.jwt_utils import decode_token
from jwt import ExpiredSignatureError


def _get_current_user() -> dict | None:
    """
    Ambil data user dari session + validasi token JWT.
    Return dict payload jika valid, None jika tidak.
    """
    token = session.get("token")
    if not token:
        return None
    try:
        payload = decode_token(token)
        return payload
    except ExpiredSignatureError:
        session.clear()
        return None
    except Exception:
        return None


def login_required(f):
    """
    Decorator: pastikan user sudah login.
    Jika belum, redirect ke halaman login.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user = _get_current_user()
        if not user:
            flash("Silakan login terlebih dahulu.", "warning")
            return redirect(url_for("routes.login_get"))
        return f(*args, **kwargs)
    return decorated


def superadmin_required(f):
    """
    Decorator: hanya superadmin yang boleh akses.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user = _get_current_user()
        if not user:
            flash("Silakan login terlebih dahulu.", "warning")
            return redirect(url_for("routes.login_get"))
        if user.get("role") != "superadmin":
            flash("Anda tidak memiliki akses ke halaman ini.", "danger")
            return redirect(url_for("routes.list_accounts_get"))
        return f(*args, **kwargs)
    return decorated


def admin_or_superadmin_required(f):
    """
    Decorator: superadmin dan admin yang sudah approved boleh akses.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user = _get_current_user()
        if not user:
            flash("Silakan login terlebih dahulu.", "warning")
            return redirect(url_for("routes.login_get"))
        role = user.get("role", "")
        if role not in ("superadmin", "admin"):
            flash("Anda tidak memiliki akses ke halaman ini.", "danger")
            return redirect(url_for("routes.login_get"))
        return f(*args, **kwargs)
    return decorated


def get_session_user() -> dict | None:
    """Helper: ambil payload user saat ini (untuk dipakai di view)."""
    return _get_current_user()