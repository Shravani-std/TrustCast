# src/trust/trust_engine.py
import os
import json
from typing import Tuple, List, Dict
import joblib
import numpy as np # type: ignore
import pandas as pd # type: ignore


try:
    import torch # type: ignore
except Exception:
    torch = None

from src.trust.trust_calculation import compute_flow_level_features, attach_aggregates_from_map # type: ignore
from src.logger.logging_handle import logger

class TrustEngine:
    """
    Loads saved artifacts (model, scaler, encoders, maps) and provides preprocess + predict.
    Supports sklearn-style models (pickle) and PyTorch models (if provided with load_fn).
    """
    def __init__(self,
                 model_path: str,
                 scaler_path: str,
                 feature_cols_path: str,
                 node_degree_map_path: str,
                 flow_rate_map_path: str,
                 ohe_path: str = None,
                 model_type: str = "sklearn",
                 torch_model_class: type = None):
        """
        model_type: "sklearn" or "torch"
        torch_model_class: if torch model, pass the class so we can load_state_dict
        """
        logger.info("Initializing TrustEngine...")
        self.model_type = model_type
        self.torch_model_class = torch_model_class

        # load model
        if model_type == "sklearn":
            logger.info(f"Loading sklearn model from {model_path}")
            self.model = joblib.load(model_path)
        elif model_type == "torch":
            if torch is None:
                raise ValueError("torch not available in this environment")
            logger.info(f"Loading torch model from {model_path}")
            if torch_model_class is None:
                raise ValueError("Provide torch_model_class to load PyTorch model")
            self.model = torch_model_class()
            self.model.load_state_dict(torch.load(model_path, map_location='cpu'))
            self.model.eval()
        else:
            raise ValueError("model_type must be 'sklearn' or 'torch'")

        # load scaler and optional OHE
        logger.info(f"Loading scaler from {scaler_path}")
        self.scaler = joblib.load(scaler_path)
        self.ohe = joblib.load(ohe_path) if (ohe_path and os.path.exists(ohe_path)) else None

        # load precomputed maps and feature columns
        logger.info("Loading node_degree and flow_rate maps")
        self.node_degree_map = joblib.load(node_degree_map_path) if os.path.exists(node_degree_map_path) else {}
        self.flow_rate_map = joblib.load(flow_rate_map_path) if os.path.exists(flow_rate_map_path) else {}

        with open(feature_cols_path, 'r') as f:
            self.feature_cols: List[str] = json.load(f)

        logger.info("TrustEngine initialized.")

    def preprocess(self, df: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """
        Compute per-flow features, attach aggregates and return scaled feature matrix + df_with_features.
        """
        logger.info("Preprocessing input dataframe (compute_flow_level_features).")
        df_features = compute_flow_level_features(df)

        logger.info("Attaching aggregate maps (node_degree, flow_rate).")
        df_features = attach_aggregates_from_map(df_features, self.node_degree_map, self.flow_rate_map)

        # If any categorical encoders must be applied, handle them here (ohe is optional)
        # NOTE: we assume feature_cols contains all numeric columns model expects.
        logger.info("Selecting ordered feature columns for model.")
        missing = [c for c in self.feature_cols if c not in df_features.columns]
        if missing:
            logger.warning(f"Missing expected features in input; filling with 0/default: {missing}")
            for c in missing:
                df_features[c] = 0.0

        X = df_features[self.feature_cols].astype(float).values
        logger.info("Scaling features with saved scaler.")
        X_scaled = self.scaler.transform(X)
        return X_scaled, df_features

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Returns df_with_features containing predictions and probabilities.
        Works for binary and multiclass sklearn models. For torch models, returns model outputs.
        """
        X_scaled, df_with_features = self.preprocess(df)

        if self.model_type == "sklearn":
            logger.info("Running sklearn model predict/predict_proba.")
            preds = self.model.predict(X_scaled)
            try:
                probs = self.model.predict_proba(X_scaled)
            except Exception:
                # model doesn't support predict_proba
                probs = None

            df_with_features['pred'] = preds
            if probs is not None:
                # if binary or multiclass
                for i in range(probs.shape[1]):
                    df_with_features[f'prob_{i}'] = probs[:, i]
            else:
                # fallback: add a single score column if available
                if hasattr(self.model, "decision_function"):
                    df_with_features['score'] = self.model.decision_function(X_scaled)

        else:  # torch
            logger.info("Running torch model inference.")
            if torch is None:
                raise RuntimeError("torch is required for torch model inference")
            with torch.no_grad():
                input_tensor = torch.tensor(X_scaled, dtype=torch.float32)
                out = self.model(input_tensor)
                # Try to interpret out
                if isinstance(out, tuple):
                    # common for (logits, ...)
                    logits = out[0]
                else:
                    logits = out
                # if logits are 2D -> softmax
                if logits.ndim == 2 and logits.shape[1] > 1:
                    probs = torch.softmax(logits, dim=1).cpu().numpy()
                    preds = probs.argmax(axis=1)
                    df_with_features['pred'] = preds
                    for i in range(probs.shape[1]):
                        df_with_features[f'prob_{i}'] = probs[:, i]
                else:
                    # single-value regression or binary
                    scores = logits.cpu().numpy().ravel()
                    df_with_features['score'] = scores
                    df_with_features['pred'] = (scores > 0.5).astype(int)

        return df_with_features

if __name__ == "__main__":
    # quick CLI for local testing - change paths as needed
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="models/classifier_best.pkl")
    parser.add_argument("--scaler", default="artifacts/scaler.joblib")
    parser.add_argument("--feature_cols", default="artifacts/feature_cols.json")
    parser.add_argument("--node_degree", default="artifacts/node_degree_map.joblib")
    parser.add_argument("--flow_rate", default="artifacts/flow_rate_map.joblib")
    parser.add_argument("--ohe", default=None)
    parser.add_argument("--input", default="data/infer_sample.csv")
    parser.add_argument("--output", default="data/infer_results.csv")
    args = parser.parse_args()

    logger.info("Starting TrustEngine CLI inference.")
    engine = TrustEngine(
        model_path=args.model,
        scaler_path=args.scaler,
        feature_cols_path=args.feature_cols,
        node_degree_map_path=args.node_degree,
        flow_rate_map_path=args.flow_rate,
        ohe_path=args.ohe,
        model_type="sklearn"
    )

    df = pd.read_csv(args.input)
    out = engine.predict(df)
    out.to_csv(args.output, index=False)
    logger.info(f"Saved inference results to {args.output}")
