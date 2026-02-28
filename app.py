import numpy as np #type:ignore
import pandas as pd #type:ignore
import joblib #type:ignore
import tensorflow as tf #type:ignore
import os
from fastapi import FastAPI, UploadFile, File #type:ignore
from fastapi.middleware.cors import CORSMiddleware #type:ignore
from fastapi.responses import JSONResponse #type:ignore

from src.TrustEngine.data_preprocessing import DataPreprocessing
from src.TrustEngine.feature_eng import FeatureEngineering
from src.TrustEngine.trust_engine import TrustEngine
from src.TrustEngine.model_building import AttentionLayer


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

    try:
        logger.info("Prediction request received")

        df = pd.read_csv(file.file)
        logger.info(f"CSV loaded successfully. Shape: {df.shape}")

        # Preprocessing
        logger.info("Starting preprocessing")
        df = preprocessor.preprocess(df)

        logger.info("Applying feature engineering")
        df = feature_engineer.apply(df)

        logger.info("Applying trust engine transformation")
        df = trust_engine.apply(df)

        if "Label" in df.columns:
            logger.info("Dropping Label column")
            df = df.drop("Label", axis=1)

        df = df.select_dtypes(include=["number"])
        logger.info(f"Numeric feature count: {df.shape[1]}")

        # Feature alignment
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_columns]

        X = scaler.transform(df).astype(np.float32)
        logger.info("Scaling completed")

        if len(X) <= WINDOW:
            logger.warning("Not enough rows to create sequences")
            return JSONResponse(
                status_code=400,
                content={"error": "Not enough rows to create sequences."}
            )

        X_seq = create_sequences(X, WINDOW)
        logger.info(f"Sequences created: {len(X_seq)}")

        # Prediction
        logger.info("Running model prediction")
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
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


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