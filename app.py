import numpy as np #type:ignore
import pandas as pd #type:ignore
import joblib #type:ignore
import tensorflow as tf #type:ignore
import os
from fastapi import FastAPI, UploadFile, File, HTTPException #type:ignore
from fastapi.middleware.cors import CORSMiddleware #type:ignore
from fastapi.responses import JSONResponse #type:ignore
from src.TrustEngine.feature_eng import FeatureEngineering
from src.TrustEngine.trust_engine import TrustEngine
from src.TrustEngine.model_building import AttentionLayer
from src.TrustEngine.data_preprocessing import DataPreprocessing
from models import SignupModel, LoginModel
from database import users_collection, contacts_collection
from auth import hash_password, verify_password, create_access_token
from datetime import datetime

uploaded_df = None
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://127.0.0.1:5173"
    ],
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

import logging
from datetime import datetime

# Create logs folder if not exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FOLDER = os.path.join(BASE_DIR, "logs")

if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)

# Create unique log file per server run
log_filename = os.path.join(
    LOG_FOLDER,
    f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("TrustCastLogger")


@app.get("/logs")
def get_logs():
    all_logs = []

    if not os.path.exists(LOG_FOLDER):
        return []

    for filename in os.listdir(LOG_FOLDER):
        if filename.endswith(".log"):
            file_path = os.path.join(LOG_FOLDER, filename)

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

                        all_logs.append({
                            "id": f"{filename}-{timestamp}",
                            "time": timestamp,
                            "actor": "TrustCast",
                            "action": level,
                            "details": message,
                            "level": level
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


# ==========================
# SIGNUP
# ==========================

@app.post("/signup")
async def signup(user: SignupModel):

    existing_user = await users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "organization": user.organization,
        "password": hash_password(user.password),
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "last_login": None
    }

    result = await users_collection.insert_one(
        new_user
    )

    token = create_access_token(
        {"email": user.email}
    )

    return {
        "message": "Account created successfully",
        "user_id": str(result.inserted_id),
        "access_token": token
    }


# ==========================
# LOGIN
# ==========================

@app.post("/login")
async def login(user: LoginModel):

    db_user = await users_collection.find_one(
        {"email": user.email}
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    await users_collection.update_one(
        {"email": user.email},
        {
            "$set": {
                "last_login": datetime.utcnow()
            }
        }
    )

    token = create_access_token(
        {
            "email": db_user["email"],
            "name": db_user["full_name"]
        }
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "user": {
            "full_name": db_user["full_name"],
            "email": db_user["email"],
            "organization": db_user.get("organization", "")
        }
    }



@app.post("/contact")
async def submit_contact(payload: dict):
    """Save contact form submissions to MongoDB 'contacts' collection."""
    name = payload.get("name")
    email = payload.get("email")
    subject = payload.get("subject")
    message = payload.get("message")

    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="name, email and message are required")

    doc = {
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "created_at": datetime.utcnow()
    }

    result = await contacts_collection.insert_one(doc)

    return {"message": "Message received", "id": str(result.inserted_id)}


