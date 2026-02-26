import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import joblib
import os


class SequenceGenerator(tf.keras.utils.Sequence):

    def __init__(self, X, y, window=20, batch_size=64):
        self.X = X
        self.y = y
        self.window = window
        self.batch_size = batch_size

    def __len__(self):
        return (len(self.X) - self.window) // self.batch_size

    def __getitem__(self, idx):
        batch_X = []
        batch_y = []

        start = idx * self.batch_size
        end = start + self.batch_size

        for i in range(start, end):
            batch_X.append(self.X[i:i+self.window])
            batch_y.append(self.y.iloc[i+self.window])

        return np.array(batch_X), np.array(batch_y)


class ModelTrainer:

    def train(self, builder, train_df, val_df):

        scaler = StandardScaler()

        # --------------------------
        # Split
        # --------------------------
        X_train = train_df.drop("Label", axis=1)
        y_train = train_df["Label"]

        X_val = val_df.drop("Label", axis=1)
        y_val = val_df["Label"]

        # --------------------------
        # Keep only numeric
        # --------------------------
        X_train = X_train.select_dtypes(include=['number'])
        X_val = X_val.select_dtypes(include=['number'])

        # 🔥 SAVE CORRECT FEATURE ORDER (after filtering)
        save_dir = "D:\\AI\\TrustCast\\models"
        os.makedirs(save_dir, exist_ok=True)

        feature_columns = X_train.columns.tolist()
        joblib.dump(feature_columns, os.path.join(save_dir, "feature_columns.pkl"))

        # --------------------------
        # Reset index
        # --------------------------
        y_train = y_train.reset_index(drop=True)
        y_val = y_val.reset_index(drop=True)

        # --------------------------
        # Scaling
        # --------------------------
        X_train = scaler.fit_transform(X_train).astype(np.float32)
        X_val = scaler.transform(X_val).astype(np.float32)

        window = 20
        batch_size = 64

        feature_dim = X_train.shape[1]
        model = builder.build(window, feature_dim)

        train_gen = SequenceGenerator(X_train, y_train, window, batch_size)
        val_gen = SequenceGenerator(X_val, y_val, window, batch_size)

        model.fit(
            train_gen,
            validation_data=val_gen,
            epochs=30
        )

        return model, scaler