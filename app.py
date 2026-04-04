import numpy as np #type:ignore
import pandas as pd #type:ignore
import joblib #type:ignore
import os
import logging
import re
import sqlite3
import hashlib
import hmac
import base64
from datetime import datetime
from typing import Optional

os.environ["TF_USE_LEGACY_KERAS"] = "1"

import tensorflow as tf #type:ignore

from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status #type:ignore
from fastapi.middleware.cors import CORSMiddleware #type:ignore
from fastapi.responses import JSONResponse #type:ignore
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials #type:ignore
from pydantic import BaseModel #type:ignore
import jwt #type:ignore
from dotenv import load_dotenv
load_dotenv()

from src.TrustEngine.feature_eng import FeatureEngineering
from src.TrustEngine.trust_engine import TrustEngine
from src.TrustEngine.model_building import AttentionLayer
from src.TrustEngine.data_preprocessing import DataPreprocessing


uploaded_df = None
APP_DIR = Path(__file__).resolve().parent

# ── Logging setup ──
LOG_FOLDER = APP_DIR / "logs"
os.makedirs(LOG_FOLDER, exist_ok=True)
log_filename = LOG_FOLDER / f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("TrustCastLogger")
app = FastAPI()

cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "D:\\AI\\TrustCast\\models\\trustcast_bigru_attention.h5"
SCALER_PATH = "D:\\AI\\TrustCast\\models\\scaler.pkl"
FEATURE_PATH = "D:\\AI\\TrustCast\\models\\feature_columns.pkl"


model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"AttentionLayer": AttentionLayer},
    compile=False
)

scaler = joblib.load(SCALER_PATH)
feature_columns = joblib.load(FEATURE_PATH)
# ── Auth setup ──
DB_PATH = Path(os.getenv("AUTH_DB_PATH", str(APP_DIR / "trustcast_auth.db")))
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
bearer_scheme = HTTPBearer()

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,}$"
)


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    organization: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db() -> None:
    conn = get_db_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                organization TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email.strip()))


def validate_password(password: str) -> bool:
    return bool(PASSWORD_REGEX.match(password))


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return base64.b64encode(salt + key).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    decoded = base64.b64decode(stored_hash.encode("utf-8"))
    salt, stored_key = decoded[:16], decoded[16:]
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return hmac.compare_digest(stored_key, derived_key)


def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": int(datetime.utcnow().timestamp()) + (JWT_EXPIRES_MINUTES * 60),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub", "0"))
        email = payload.get("email")
        if user_id <= 0 or not email:
            raise ValueError("Invalid token payload")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT id, name, email, organization, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return dict(row)


init_auth_db()


@app.post("/auth/register")
def register_user(payload: RegisterRequest):
    email = payload.email.strip().lower()
    name = payload.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if not validate_password(payload.password):
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least 8 characters and include uppercase, "
                "lowercase, number, and special character"
            ),
        )   

    conn = get_db_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        cursor = conn.execute(
            """
            INSERT INTO users(name, email, password_hash, organization, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                name,
                email,
                hash_password(payload.password),
                (payload.organization or "").strip() or None,
                datetime.utcnow().isoformat(),
            ),
        )
        conn.commit()
        user_id = int(cursor.lastrowid)
    finally:
        conn.close()

    token = create_access_token(user_id=user_id, email=email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "organization": payload.organization,
        },
    }


@app.post("/auth/login")
def login_user(payload: LoginRequest):
    email = payload.email.strip().lower()
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT id, name, email, password_hash, organization, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    finally:
        conn.close()

    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user_id=int(row["id"]), email=row["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "organization": row["organization"],
            "created_at": row["created_at"],
        },
    }


@app.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

def resolve_resource_path(env_key: str, rel_path: str, legacy_abs: str) -> Path:
    """
    Resolve model resources using:
    1) explicit env var
    2) repo-relative path (if present)
    3) legacy absolute path (for backwards compatibility)
    """
    env_val = os.getenv(env_key)
    if env_val and env_val.strip():
        return Path(env_val.strip())

    candidate = (APP_DIR / rel_path).resolve()
    if candidate.exists():
        return candidate

    return Path(legacy_abs)


MODEL_PATH = resolve_resource_path(
    "MODEL_PATH",
    "models/trustcast_bigru_attention.h5",
    r"D:\AI\TrustCast\models\trustcast_bigru_attention.h5",
)
SCALER_PATH = resolve_resource_path(
    "SCALER_PATH",
    "models/scaler.pkl",
    r"D:\AI\TrustCast\models\scaler.pkl",
)
FEATURE_PATH = resolve_resource_path(
    "FEATURE_PATH",
    "models/feature_columns.pkl",
    r"D:\AI\TrustCast\models\feature_columns.pkl",
)

for _p, _k in [
    (MODEL_PATH, "MODEL_PATH"),
    (SCALER_PATH, "SCALER_PATH"),
    (FEATURE_PATH, "FEATURE_PATH"),
]:
    if not _p.exists():
        raise FileNotFoundError(
            f"Required resource not found: {_p}\n"
            f"Set the environment variable {_k} to the correct path."
        )

try:
    model = tf.keras.models.load_model(
        str(MODEL_PATH),
        custom_objects={"AttentionLayer": AttentionLayer},
        compile=False
    )
    logger.info(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    logger.warning(f"Standard load failed ({e}), trying legacy h5 loader...")
    from keras.src.legacy.saving import legacy_h5_format
    model = legacy_h5_format.load_model_from_hdf5(
        str(MODEL_PATH),
        custom_objects={"AttentionLayer": AttentionLayer}
    )
    logger.info("Model loaded via legacy h5 loader")

scaler = joblib.load(str(SCALER_PATH))
feature_columns = joblib.load(str(FEATURE_PATH))

WINDOW = 20

# Initialize pipeline components
preprocessor = DataPreprocessing()
feature_engineer = FeatureEngineering()
trust_engine = TrustEngine()


def create_sequences(X, window=20):
    sequences = []
    for i in range(len(X) - window):
        sequences.append(X[i:i+window])
    return np.array(sequences)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global uploaded_df

    try:
        logger.info("Prediction request received")

        uploaded_df = pd.read_csv(file.file)
        logger.info(f"CSV loaded successfully. Shape: {uploaded_df.shape}")

        df = uploaded_df.copy()

        # Preprocessing
        df = preprocessor.preprocess(df)
        df = feature_engineer.apply(df)
        df = trust_engine.apply(df)

        if "Label" in df.columns:
            df = df.drop("Label", axis=1)

        df = df.select_dtypes(include=["number"])

        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_columns]

        X = scaler.transform(df).astype(np.float32)

        if len(X) <= WINDOW:
            return JSONResponse(
                status_code=400,
                content={"error": "Not enough rows to create sequences."}
            )

        X_seq = create_sequences(X, WINDOW)

        y_prob = model.predict(X_seq)
        y_pred = (y_prob > 0.5).astype(int)

        logger.info("Prediction completed successfully")

        return {
            "num_sequences": len(X_seq),
            "predictions": y_pred.flatten().tolist(),
            "probabilities": y_prob.flatten().tolist()
        }

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})




@app.get("/logs")
def get_logs():
    all_logs = []

    if not LOG_FOLDER.exists():
        return []

    for filename in os.listdir(LOG_FOLDER):
        if filename.endswith(".log"):
            file_path = os.path.join(str(LOG_FOLDER), filename)

            with open(file_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    # Your log format:
                    # 2026-02-28 17:36:00 | INFO | Message

                    parts = line.split("|")

                    if len(parts) >= 3:
                        timestamp = parts[0].strip()
                        level = parts[1].strip()
                        message = parts[2].strip()

                        level_upper = str(level).upper()
                        if level_upper == "INFO":
                            ui_level = "Info"
                        elif level_upper == "WARNING":
                            ui_level = "Warning"
                        elif level_upper in ("ERROR", "CRITICAL", "EXCEPTION"):
                            ui_level = "Critical"
                        else:
                            ui_level = str(level).title()

                        all_logs.append({
                            "id": f"{filename}-{timestamp}",
                            "time": timestamp,
                            "actor": "TrustCast",
                            "action": ui_level,
                            "details": message,
                            "level": ui_level
                        })

    # Sort newest first
    all_logs.sort(key=lambda x: x["time"], reverse=True)

    return all_logs

@app.post("/api/trust-score")
def get_trust_score(data: dict):

    global uploaded_df

    try:
        if uploaded_df is None:
            return JSONResponse(
                status_code=400,
                content={"error": "No dataset uploaded yet"}
            )

        srcip = data.get("srcip")

        if not srcip:
            return JSONResponse(
                status_code=400,
                content={"error": "srcip is required"}
            )

        if "srcip" not in uploaded_df.columns:
            return JSONResponse(
                status_code=400,
                content={"error": "srcip column not found"}
            )

        # Filter rows for selected device
        device_df = uploaded_df[uploaded_df["srcip"] == srcip]

        if device_df.empty:
            return {
                "srcip": srcip,
                "trust_score": 100,
                "timeline": {"labels": [], "values": []},
                "anomalies": []
            }

        df = device_df.copy()

        # Save attack labels BEFORE preprocessing
        attack_labels = df["attack_cat"] if "attack_cat" in df.columns else None

        # Run pipeline
        df = preprocessor.preprocess(df)
        df = feature_engineer.apply(df)
        df = trust_engine.apply(df)

        # Calculate trust score
        trust_score = round(float(df["Trust_Score"].mean()) * 100, 2)

        # Build timeline (last 20 points)
        timeline_values = (df["Trust_Score"] * 100).round(2).tail(20)

        timeline = {
            "labels": list(range(len(timeline_values))),
            "values": timeline_values.tolist()
        }

        # Detect anomalies from attack_cat
        anomalies = []

        if attack_labels is not None:
            attack_rows = attack_labels[attack_labels != "Normal"]

            for i, attack in attack_rows.head(5).items():
                anomalies.append({
                    "index": int(i),
                    "attack_type": str(attack)
                })

        return {
            "srcip": srcip,
            "trust_score": trust_score,
            "timeline": timeline,
            "anomalies": anomalies
        }

    except Exception as e:
        import traceback
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get("/api/devices")
def get_devices():

    global uploaded_df

    if uploaded_df is None:
        return []

    if "srcip" not in uploaded_df.columns:
        return []

    devices = []
    device_ips = uploaded_df["srcip"].unique()

    for i, ip in enumerate(device_ips):

        device_df = uploaded_df[uploaded_df["srcip"] == ip]

        df = device_df.copy()

        df = preprocessor.preprocess(df)
        df = feature_engineer.apply(df)
        df = trust_engine.apply(df)

        trust_score = round(float(df["Trust_Score"].mean()) * 100, 2)

        if trust_score > 80:
            status = "Healthy"
        elif trust_score > 50:
            status = "Low Trust"
        else:
            status = "Anomaly"

        devices.append({
            "id": f"D-{i+1:03}",
            "ip": ip,
            "status": status,
            "trust": trust_score,
            "lastSeen": "Just now"
        })

    return devices

