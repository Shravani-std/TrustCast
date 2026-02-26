from sklearn.metrics import classification_report, roc_auc_score
import numpy as np
import joblib
import os


class ModelEvaluator:

    def evaluate(self, model, scaler, test_df):

        save_dir = "D:\\AI\\TrustCast\\models"

        # ----------------------------------------
        # 1️⃣ Load training feature schema
        # ----------------------------------------
        feature_columns = joblib.load(
            os.path.join(save_dir, "feature_columns.pkl")
        )

        # ----------------------------------------
        # 2️⃣ Split features & label
        # ----------------------------------------
        X_test = test_df.drop("Label", axis=1)
        y_test = test_df["Label"]

        # ----------------------------------------
        # 3️⃣ Keep only numeric (same as training)
        # ----------------------------------------
        X_test = X_test.select_dtypes(include=['number'])

        # ----------------------------------------
        # 4️⃣ Add missing columns
        # ----------------------------------------
        for col in feature_columns:
            if col not in X_test.columns:
                X_test[col] = 0

        # ----------------------------------------
        # 5️⃣ Remove extra columns + reorder
        # ----------------------------------------
        X_test = X_test[feature_columns]

        # ----------------------------------------
        # 6️⃣ Scaling
        # ----------------------------------------
        X_test = scaler.transform(X_test).astype(np.float32)

        # ----------------------------------------
        # 7️⃣ Create sequences
        # ----------------------------------------
        window = 20
        X_seq = []
        y_seq = []

        for i in range(len(X_test) - window):
            X_seq.append(X_test[i:i+window])
            y_seq.append(y_test.iloc[i+window])

        X_seq = np.array(X_seq)
        y_seq = np.array(y_seq)

        # ----------------------------------------
        # 8️⃣ Prediction
        # ----------------------------------------
        y_prob = model.predict(X_seq)
        y_pred = (y_prob > 0.5).astype(int)

        print(classification_report(y_seq, y_pred))
        print("AUC:", roc_auc_score(y_seq, y_prob))