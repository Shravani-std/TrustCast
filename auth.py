import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

def hash_password(password):

    salt = bcrypt.gensalt()

    return bcrypt.hashpw(
        password.encode(),
        salt
    ).decode()

def verify_password(password, hashed_password):

    return bcrypt.checkpw(
        password.encode(),
        hashed_password.encode()
    )

def create_access_token(data):

    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow()
        + timedelta(hours=24)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )