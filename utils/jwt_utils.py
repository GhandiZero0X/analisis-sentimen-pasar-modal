# utils/jwt_utils.py
import jwt
import datetime
import os
from dotenv import load_dotenv
from jwt import ExpiredSignatureError, InvalidTokenError

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-ganti-di-env")
ALGORITHM  = "HS256"
# Token berlaku 8 jam
TOKEN_EXPIRE_HOURS = 8


def create_token(payload: dict) -> str:
    """
    Buat JWT token dari payload dict.
    Otomatis menambahkan:
        iat  — issued at (waktu dibuat)
        exp  — expiry    (8 jam dari sekarang)
    """
    now = datetime.datetime.utcnow()
    data = {
        **payload,
        "iat": now,
        "exp": now + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """
    Decode dan verifikasi JWT token.
    Return payload dict jika valid, None jika tidak.
    Raise ExpiredSignatureError jika token sudah kadaluarsa.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise   # biarkan caller handle expired
    except InvalidTokenError:
        return None