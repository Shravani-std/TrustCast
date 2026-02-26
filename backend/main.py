import numpy as np #type:ignore
import pandas as pd #type:ignore
import joblib #type:ignore
import tensorflow as tf # type:ignore
from fastapi import FastAPI, UploadFile, File #type:ignore

app = FastAPI()

model = tf.keras.models.load_model()
scaler = joblib.load()


WINDOW = 20

def create_sequesnces(X, window = 20):
    sequences = []
    for i in range(len(X) - window):
        sequences.append(X[i:i+window])
    return np.array(sequences)

@app.post("/predict")
async def predict(file:UploadFile = File(...)):

    df = pd.read_csv(file.file)

    df = df.select_dtypes(include=['number'])

    X = scaler.transform(df).astype(np.float32)
    X_seq = create_sequesnces(X, WINDOW)

    predictions = model.predict(X_seq)
    results = (predictions > 0.5).astype(int)

    return {
        "total_sequences": len(results),
        "attack_detected": int(results.sum()),
        "average_risk": float(predictions.mean())
    }