import os
import sys
import json
import argparse
from typing import Tuple, List, Dict, Any
import joblib
import numpy as np # type: ignore
import pandas as pd # type: ignore

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import f1_score, precision_recall_fscore_support, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException
# xgboost & lightgbm may not be installed in minimal env
try:
    import xgboost as xgb
except Exception:
    xgb = None

try:
    import lightgbm as lgb
except Exception:
    lgb = None

# PyTorch model
try:
    import torch
    import torch.nn as nn
    import torch.utils.data as data_utils
except Exception:
    torch = None




def load_dataframe(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Input file not found: {path}")
    df = pd.read_csv(path)
    logger.info(f"Loaded dataframe {path} shape={df.shape}")
    return df


def prepare_xy(df: pd.DataFrame, label_col: str = "label",
               drop_cols: List[str] = None) -> Tuple[pd.DataFrame, np.ndarray, List[str]]:
    """Return (X_df, y_array, feature_cols). Will auto-detect and drop non-feature columns."""
    if drop_cols is None:
        drop_cols = []
    if label_col not in df.columns:
        raise ValueError(f"Label column '{label_col}' not found in dataframe.")
   
    X_df = df.drop(columns=[label_col] + drop_cols, errors='ignore').copy()
    y = df[label_col].values

    for c in X_df.select_dtypes(include=['object']).columns:
        X_df[c] = X_df[c].fillna("nan").astype(str)
    feature_cols = X_df.columns.tolist()
    logger.info(f"Prepared X (shape={X_df.shape}) and y (shape={y.shape}).")
    return X_df, y, feature_cols


def evaluate_model(y_true: np.ndarray, y_pred: np.ndarray, y_score: np.ndarray = None) -> Dict[str, Any]:
    """Return a small metrics dict. Uses macro-F1 as main metric for comparison."""
    f1_macro = f1_score(y_true, y_pred, average='macro')
    precision, recall, f1_per_class, _ = precision_recall_fscore_support(y_true, y_pred, average=None, zero_division=0)
    metrics = {
        "f1_macro": float(f1_macro)
    }

    try:
        if y_score is not None:
            if y_score.ndim == 1 or (y_score.ndim == 2 and y_score.shape[1] == 2):
              
                try:
                    auc = roc_auc_score(y_true, y_score[:, 1] if y_score.ndim == 2 else y_score)
                except Exception:
                    auc = None
                metrics["roc_auc"] = None if auc is None else float(auc)
    except Exception:
        pass
    return metrics



# # Torch simple MLP
# class TorchMLP(nn.Module):
#     def __init__(self, input_dim: int, hidden: int = 128, n_classes: int = 2):
#         super().__init__()
#         self.net = nn.Sequential(
#             nn.Linear(input_dim, hidden),
#             nn.ReLU(),
#             nn.Dropout(0.2),
#             nn.Linear(hidden, hidden // 2),
#             nn.ReLU(),
#             nn.Dropout(0.2),
#             nn.Linear(hidden // 2, n_classes)
#         )

#     def forward(self, x):
#         return self.net(x)


# def train_torch_mlp(X_train: np.ndarray, y_train: np.ndarray,
#                     X_val: np.ndarray, y_val: np.ndarray,
#                     n_classes: int, epochs: int = 30, batch_size: int = 256, lr: float = 1e-3,
#                     device: str = "cpu") -> Tuple[nn.Module, Dict]:
#     if torch is None:
#         raise RuntimeError("torch not installed; cannot train torch MLP.")

#     device = torch.device(device)
#     model = TorchMLP(input_dim=X_train.shape[1], hidden=128, n_classes=n_classes).to(device)
#     criterion = nn.CrossEntropyLoss()
#     optim = torch.optim.Adam(model.parameters(), lr=lr)

#     train_ds = data_utils.TensorDataset(torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
#     val_ds = data_utils.TensorDataset(torch.tensor(X_val, dtype=torch.float32), torch.tensor(y_val, dtype=torch.long))

#     train_loader = data_utils.DataLoader(train_ds, batch_size=batch_size, shuffle=True)
#     val_loader = data_utils.DataLoader(val_ds, batch_size=batch_size, shuffle=False)

#     best_val_f1 = -1.0
#     best_state = None

#     for ep in range(1, epochs + 1):
#         model.train()
#         total_loss = 0.0
#         for xb, yb in train_loader:
#             xb = xb.to(device); yb = yb.to(device)
#             logits = model(xb)
#             loss = criterion(logits, yb)
#             optim.zero_grad()
#             loss.backward()
#             optim.step()
#             total_loss += loss.item() * xb.shape[0]

#         # validation
#         model.eval()
#         preds = []
#         probs = []
#         trues = []
#         with torch.no_grad():
#             for xb, yb in val_loader:
#                 xb = xb.to(device)
#                 yb = yb.to(device)
#                 logits = model(xb)
#                 prob = torch.softmax(logits, dim=1).cpu().numpy()
#                 pred = prob.argmax(axis=1)
#                 preds.append(pred); probs.append(prob); trues.append(yb.cpu().numpy())

#         preds = np.concatenate(preds)
#         probs = np.concatenate(probs)
#         trues = np.concatenate(trues)

#         metrics = evaluate_model(trues, preds, probs)
#         val_f1 = metrics.get("f1_macro", 0.0)
#         logger.info(f"[Torch MLP] Epoch {ep}/{epochs} val_f1={val_f1:.4f} loss={total_loss/len(train_ds):.4f}")

#         if val_f1 > best_val_f1:
#             best_val_f1 = val_f1
#             best_state = model.state_dict()

#     # load best
#     if best_state is not None:
#         model.load_state_dict(best_state)

#     return model, {"val_f1": best_val_f1}


# Other models
def run_classical_models(X_train: np.ndarray, y_train: np.ndarray,
                         X_val: np.ndarray, y_val: np.ndarray) -> Dict[str, Dict]:
    results = {}

    # Logistic Regression
    try:
        logger.info("Training LogisticRegression")
        lr = LogisticRegression(max_iter=1000)
        lr.fit(X_train, y_train)
        preds = lr.predict(X_val)
        probs = lr.predict_proba(X_val) if hasattr(lr, "predict_proba") else None
        metrics = evaluate_model(y_val, preds, probs)
        results["logistic_regression"] = {"model": lr, "metrics": metrics}
        logger.info(f"LR metrics: {metrics}")
    except Exception as e:
        logger.exception("LR failed.")

    # Random Forest
    try:
        logger.info("Training RandomForest")
        rf = RandomForestClassifier(n_estimators=200, n_jobs=-1)
        rf.fit(X_train, y_train)
        preds = rf.predict(X_val)
        probs = rf.predict_proba(X_val) if hasattr(rf, "predict_proba") else None
        metrics = evaluate_model(y_val, preds, probs)
        results["random_forest"] = {"model": rf, "metrics": metrics}
        logger.info(f"RF metrics: {metrics}")
    except Exception as e:
        logger.exception("RF failed.")

    # XGBoost
    if xgb is not None:
        try:
            logger.info("Training XGBoost")
            xgb_clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss", n_jobs=-1)
            xgb_clf.fit(X_train, y_train)
            preds = xgb_clf.predict(X_val)
            probs = xgb_clf.predict_proba(X_val) if hasattr(xgb_clf, "predict_proba") else None
            metrics = evaluate_model(y_val, preds, probs)
            results["xgboost"] = {"model": xgb_clf, "metrics": metrics}
            logger.info(f"XGB metrics: {metrics}")
        except Exception:
            logger.exception("XGBoost failed.")

    # LightGBM
    if lgb is not None:
        try:
            logger.info("Training LightGBM")
            lgb_clf = lgb.LGBMClassifier(n_jobs=-1)
            lgb_clf.fit(X_train, y_train)
            preds = lgb_clf.predict(X_val)
            probs = lgb_clf.predict_proba(X_val) if hasattr(lgb_clf, "predict_proba") else None
            metrics = evaluate_model(y_val, preds, probs)
            results["lightgbm"] = {"model": lgb_clf, "metrics": metrics}
            logger.info(f"LGB metrics: {metrics}")
        except Exception:
            logger.exception("LightGBM failed.")

    # Sklearn MLP
    try:
        logger.info("Training Sklearn MLPClassifier")
        mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=300)
        mlp.fit(X_train, y_train)
        preds = mlp.predict(X_val)
        probs = mlp.predict_proba(X_val) if hasattr(mlp, "predict_proba") else None
        metrics = evaluate_model(y_val, preds, probs)
        results["sklearn_mlp"] = {"model": mlp, "metrics": metrics}
        logger.info(f"MLP metrics: {metrics}")
    except Exception:
        logger.exception("Sklearn MLP failed.")

    return results


def pick_best(results: Dict[str, Dict]) -> Tuple[str, Any, Dict]:
    """Pick best model by f1_macro metric"""
    best_name = None
    best_score = -1.0
    best_model = None
    best_metrics = None
    for name, info in results.items():
        m = info.get("metrics", {})
        score = m.get("f1_macro", -1.0)
        if score is None:
            score = -1.0
        if score > best_score:
            best_score = score
            best_name = name
            best_model = info.get("model")
            best_metrics = m
    return best_name, best_model, best_metrics


#main
def main(args):
    try:
        df = load_dataframe(args.input)
        # optional augmentation files (list)
        if args.augment:
            aug_dfs = []
            for p in args.augment:
                if os.path.exists(p):
                    aug_dfs.append(pd.read_csv(p))
                else:
                    logger.warning(f"Augment file not found: {p}")
            if aug_dfs:
                logger.info("Concatenating augmentation data to training set.")
                df = pd.concat([df] + aug_dfs, ignore_index=True)
                logger.info(f"After augmentation df.shape={df.shape}")

        # Prepare X,y
        drop_cols = args.drop_cols.split(",") if args.drop_cols else []
        X_df, y_raw, feature_cols = prepare_xy(df, label_col=args.label_col, drop_cols=drop_cols)

        # Encode labels
        le = LabelEncoder()
        y = le.fit_transform(y_raw)
        n_classes = len(le.classes_)
        logger.info(f"Detected {n_classes} classes: {list(le.classes_)}")

        # Train/val split
        X_train_df, X_val_df, y_train, y_val = train_test_split(X_df, y, test_size=args.test_size,
                                                                random_state=args.random_state, stratify=y)
        # Scale numeric features
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train_df.values)
        X_val = scaler.transform(X_val_df.values)

        # Train classical models
        classical_results = run_classical_models(X_train, y_train, X_val, y_val)

        # Train torch MLP (if available)
        torch_result = {}
        if torch is not None and args.train_torch:
            try:
                logger.info("Training Torch MLP")
                model_torch, stats = train_torch_mlp(X_train, y_train, X_val, y_val, n_classes=n_classes,
                                                     epochs=args.torch_epochs, batch_size=args.torch_batch_size,
                                                     lr=args.torch_lr, device=args.device)
                torch_result = {"torch_mlp": {"model": model_torch, "metrics": {"f1_macro": float(stats["val_f1"])}}}
            except Exception:
                logger.exception("Torch training failed.")

        # merge results
        all_results = {**classical_results, **torch_result}

        # pick best
        best_name, best_model, best_metrics = pick_best(all_results)
        logger.info(f"Best model: {best_name} | metrics: {best_metrics}")

        # Create output dirs
        os.makedirs(args.out_dir, exist_ok=True)
        model_dir = os.path.join(args.out_dir, "models")
        artifacts_dir = os.path.join(args.out_dir, "artifacts")
        os.makedirs(model_dir, exist_ok=True)
        os.makedirs(artifacts_dir, exist_ok=True)

        # Save best model
        model_path = os.path.join(model_dir, f"{best_name}.joblib")
        if best_name and best_model is not None:
            if torch is not None and isinstance(best_model, nn.Module):
                torch.save(best_model.state_dict(), model_path.replace(".joblib", ".pt"))
                logger.info(f"Saved torch model state to {model_path.replace('.joblib', '.pt')}")
            else:
                joblib.dump(best_model, model_path)
                logger.info(f"Saved sklearn model to {model_path}")

        # Save scaler, feature columns, label encoder, and example node/flow maps placeholders
        joblib.dump(scaler, os.path.join(artifacts_dir, "scaler.joblib"))
        joblib.dump(le, os.path.join(artifacts_dir, "label_encoder.joblib"))
        json.dump(feature_cols, open(os.path.join(artifacts_dir, "feature_cols.json"), "w"))
        # If you have precomputed node_degree_map and flow_rate_map, save them here.
        # For now create simple maps from training df
        node_degree_map = df.groupby("src_ip")["dst_ip"].nunique().to_dict() if "src_ip" in df.columns else {}
        flow_rate_map = df["src_ip"].value_counts().to_dict() if "src_ip" in df.columns else {}
        joblib.dump(node_degree_map, os.path.join(artifacts_dir, "node_degree_map.joblib"))
        joblib.dump(flow_rate_map, os.path.join(artifacts_dir, "flow_rate_map.joblib"))

        logger.info("Saved all artifacts.")
        logger.info("Training script finished.")

    except Exception as e:
        logger.exception("Training failed.")
        raise CustomException(e, sys)


# if __name__ == "__main__":
#     parser = argparse.ArgumentParser()
#     parser.add_argument("--input", type=str, required=True, help="Path to train_feature_engineered.csv")
#     parser.add_argument("--out_dir", type=str, default="artifacts", help="Output directory for models & artifacts")
#     parser.add_argument("--label_col", type=str, default="label", help="Name of label column")
#     parser.add_argument("--drop_cols", type=str, default="", help="Comma-separated columns to drop from features")
#     parser.add_argument("--test_size", type=float, default=0.2)
#     parser.add_argument("--random_state", type=int, default=42)
#     parser.add_argument("--augment", nargs="*", default=None, help="Optional augmentation CSV files to append")
#     parser.add_argument("--train_torch", action="store_true", help="Whether to train Torch MLP")
#     parser.add_argument("--torch_epochs", type=int, default=30)
#     parser.add_argument("--torch_batch_size", type=int, default=256)
#     parser.add_argument("--torch_lr", type=float, default=1e-3)
#     parser.add_argument("--device", type=str, default="cpu")
#     args = parser.parse_args()
#     main(args)
