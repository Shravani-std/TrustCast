import sys
import os
import joblib #type:ignore
import pandas as pd #type:ignore
import numpy as np #type:ignore

from sklearn.ensemble import RandomForestClassifier #type:ignore
from sklearn.metrics import ( #type:ignore
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
)
from xgboost import XGBClassifier #type:ignore

from TrustCast.src.steps.trust import TrustEngine
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class ModelTrainer:

    def __init__(self, target_col: str = "Label"):
        self.target_col = target_col
        self.models = {}

    def _split_xy(self, df: pd.DataFrame):
        X = df.drop(columns=[self.target_col])
        y = df[self.target_col]
        return X, y

    def evaluate(self, model, test_df, model_name: str):
        try:
            X_test, y_test = self._split_xy(test_df)

            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            results = {
                "Accuracy": accuracy_score(y_test, y_pred),
                "Precision": precision_score(y_test, y_pred),
                "Recall": recall_score(y_test, y_pred),
                "F1": f1_score(y_test, y_pred),
                "ROC_AUC": roc_auc_score(y_test, y_prob),
            }

            print(f"\n=== {model_name} Report ===")
            print(classification_report(y_test, y_pred))
            logger.info(f"{model_name} Results: {results}")

            return results

        except Exception as e:
            raise CustomException(e, sys)

    def train_random_forest(self, train_df: pd.DataFrame):
        X_train, y_train = self._split_xy(train_df)

        rf = RandomForestClassifier(
            n_estimators=200,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )

        rf.fit(X_train, y_train)
        self.models["RandomForest"] = rf
        return rf

    def train_xgboost(self, train_df: pd.DataFrame):
        X_train, y_train = self._split_xy(train_df)

        scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

        xgb = XGBClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            scale_pos_weight=scale_pos_weight,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        )

        xgb.fit(X_train, y_train)
        self.models["XGBoost"] = xgb
        return xgb

    def save_model(self, model, name: str):
        save_dir = "D:\\AI\\TrustCast\\models"
        os.makedirs(save_dir, exist_ok=True)
        joblib.dump(model, os.path.join(save_dir, f"{name}.pkl"))


# MAIN EXECUTION

if __name__ == "__main__":
    try:
        logger.info("===== Model Training Started =====")

        train_df = pd.read_csv("D:\\AI\\TrustCast\\data\\train.csv")
        test_df = pd.read_csv("D:\\AI\\TrustCast\\data\\test.csv")

        # Apply Trust Engine BEFORE training
        trust_engine = TrustEngine()
        train_df = trust_engine.apply_all(train_df)
        test_df = trust_engine.apply_all(test_df)

        trainer = ModelTrainer(target_col="Label")

        # Random Forest
        rf_model = trainer.train_random_forest(train_df)
        trainer.evaluate(rf_model, test_df, "RandomForest")
        trainer.save_model(rf_model, "random_forest_model")

        # XGBoost
        xgb_model = trainer.train_xgboost(train_df)
        trainer.evaluate(xgb_model, test_df, "XGBoost")
        trainer.save_model(xgb_model, "xgboost_model")

        logger.info("===== Model Training Completed Successfully =====")

    except Exception as e:
        logger.error("Model training failed.")
        raise CustomException(e, sys)
