import sys
import os
from typing import Optional
import numpy as np
import pandas as pd
import torch  # type: ignore
import torch.nn as nn  # type: ignore

from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class _Generator(nn.Module):
    def __init__(self, noise_dim: int, label_dim: int, output_dim: int):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(noise_dim + label_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, output_dim)
        )

    def forward(self, noise, labels):
        x = torch.cat([noise, labels], dim=1)
        return self.model(x)


class _Discriminator(nn.Module):
    def __init__(self, input_dim: int, label_dim: int):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(input_dim + label_dim, 128),
            nn.LeakyReLU(0.2),
            nn.Linear(128, 64),
            nn.LeakyReLU(0.2),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, data, labels):
        x = torch.cat([data, labels], dim=1)
        return self.model(x)


class ConditionalGANModel:
    """Conditional GAN for class-conditioned synthetic tabular data generation"""

    def __init__(self, input_dim: int, label_dim: int, noise_dim: int = 32, lr: float = 2e-4, device: Optional[str] = None):
        try:
            logger.info("Initializing Conditional GAN...")
            self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
            self.generator = _Generator(noise_dim, label_dim, input_dim).to(self.device)
            self.discriminator = _Discriminator(input_dim, label_dim).to(self.device)

            self.opt_g = torch.optim.Adam(self.generator.parameters(), lr=lr)
            self.opt_d = torch.optim.Adam(self.discriminator.parameters(), lr=lr)

            self.loss_fn = nn.BCELoss()
            self.noise_dim = noise_dim
            self.label_dim = label_dim
            logger.info(f"CGAN initialized on device={self.device}")
        except Exception as e:
            logger.error("Error initializing CGAN.")
            raise CustomException(e, sys)

    def fit(self, data: np.ndarray, labels: np.ndarray, epochs: int = 200, batch_size: int = 256):
        """
        data: (N, input_dim) numpy array
        labels: (N, label_dim) numpy array (one-hot or multi-hot)
        """
        try:
            logger.info(f"Training CGAN: epochs={epochs}, batch_size={batch_size}")
            X = torch.tensor(data, dtype=torch.float32, device=self.device)
            Y = torch.tensor(labels, dtype=torch.float32, device=self.device)
            N = X.shape[0]

            for epoch in range(epochs):
                perm = torch.randperm(N)
                epoch_loss_d = 0.0
                epoch_loss_g = 0.0

                for i in range(0, N, batch_size):
                    idx = perm[i:i + batch_size]
                    real_x = X[idx]
                    real_y = Y[idx]
                    cur_bs = real_x.size(0)

                    # Discriminator update
                    noise = torch.randn(cur_bs, self.noise_dim, device=self.device)
                    fake_x = self.generator(noise, real_y)

                    real_pred = self.discriminator(real_x, real_y)
                    fake_pred = self.discriminator(fake_x.detach(), real_y)

                    loss_d = (self.loss_fn(real_pred, torch.ones_like(real_pred)) +
                              self.loss_fn(fake_pred, torch.zeros_like(fake_pred))) / 2.0

                    self.opt_d.zero_grad()
                    loss_d.backward()
                    self.opt_d.step()

                    # Generator update
                    noise = torch.randn(cur_bs, self.noise_dim, device=self.device)
                    fake_x = self.generator(noise, real_y)
                    fake_pred_for_g = self.discriminator(fake_x, real_y)
                    loss_g = self.loss_fn(fake_pred_for_g, torch.ones_like(fake_pred_for_g))

                    self.opt_g.zero_grad()
                    loss_g.backward()
                    self.opt_g.step()

                    epoch_loss_d += loss_d.item() * cur_bs
                    epoch_loss_g += loss_g.item() * cur_bs

                epoch_loss_d /= N
                epoch_loss_g /= N

                if epoch % max(1, epochs // 10) == 0 or epoch < 5:
                    logger.info(f"Epoch {epoch+1}/{epochs} | Loss D: {epoch_loss_d:.6f} | Loss G: {epoch_loss_g:.6f}")

            logger.info("CGAN training completed successfully.")
        except Exception as e:
            logger.error("Error during CGAN training.")
            raise CustomException(e, sys)

    def generate(self, n: int, label_vector: np.ndarray) -> np.ndarray:
        """
        Generate synthetic samples conditioned on label_vector.
        label_vector: (label_dim,) numpy vector or (n, label_dim)
        Returns: synthetic np.ndarray shape (n, input_dim)
        """
        try:
            logger.info(f"Generating {n} CGAN samples...")
            self.generator.eval()

            if label_vector.ndim == 1:
                labels = np.repeat(label_vector[np.newaxis, :], n, axis=0)
            else:
                if label_vector.shape[0] != n:
                    raise ValueError("label_vector rows must equal n when providing per-sample labels.")
                labels = label_vector

            noise = torch.randn(n, self.noise_dim, device=self.device)
            labels_t = torch.tensor(labels, dtype=torch.float32, device=self.device)
            with torch.no_grad():
                synthetic = self.generator(noise, labels_t).cpu().numpy()

            logger.info("CGAN synthetic data generated.")
            return synthetic
        except Exception as e:
            logger.error("Error generating CGAN samples.")
            raise CustomException(e, sys)

    def save(self, g_path: str, d_path: str):
        try:
            torch.save(self.generator.state_dict(), g_path)
            torch.save(self.discriminator.state_dict(), d_path)
            logger.info(f"CGAN saved: {g_path}, {d_path}")
        except Exception as e:
            logger.error("Error saving CGAN.")
            raise CustomException(e, sys)

    def load(self, g_path: str, d_path: str):
        try:
            self.generator.load_state_dict(torch.load(g_path, map_location=self.device))
            self.discriminator.load_state_dict(torch.load(d_path, map_location=self.device))
            logger.info("CGAN loaded successfully.")
        except Exception as e:
            logger.error("Error loading CGAN.")
            raise CustomException(e, sys)


def _prepare_data_for_cgan(df: pd.DataFrame, feature_cols: Optional[list] = None, label_col: Optional[str] = None):
    """
    Auto-detect feature columns and label vectors:
      - If label_col is provided, it will be one-hot encoded.
      - If no label_col but one-hot type_* columns exist, they will be used as labels.
      - feature_cols can be provided; otherwise all numeric columns except label columns are used.
    Returns: data_np, labels_np, feature_columns_list, label_columns_list
    """
    try:
        df = df.copy()
        label_cols = []
        if label_col and label_col in df.columns:
            labels_df = pd.get_dummies(df[label_col].astype(str), prefix=label_col)
            label_cols = labels_df.columns.tolist()
            df = pd.concat([df.drop(columns=[label_col]), labels_df], axis=1)
        else:
            type_cols = [c for c in df.columns if c.startswith("type_") or c.startswith("label_")]
            if len(type_cols) > 0:
                label_cols = type_cols
            else:
                if 'type' in df.columns:
                    labels_df = pd.get_dummies(df['type'].astype(str), prefix='type')
                    label_cols = labels_df.columns.tolist()
                    df = pd.concat([df.drop(columns=['type']), labels_df], axis=1)

        # choose feature columns: numeric columns excluding label_cols
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        feature_cols = feature_cols or [c for c in numeric_cols if c not in label_cols]

        if len(feature_cols) == 0:
            raise ValueError("No numeric feature columns found for CGAN input.")

        if len(label_cols) == 0:
            # if still no label columns, create a dummy single-class label (all zeros)
            df['cgan_label_dummy'] = 1
            label_cols = ['cgan_label_dummy']

        data_np = df[feature_cols].fillna(0).to_numpy(dtype=np.float32)
        labels_np = df[label_cols].fillna(0).to_numpy(dtype=np.float32)

        logger.info(f"Prepared CGAN data: data.shape={data_np.shape}, labels.shape={labels_np.shape}")
        return data_np, labels_np, feature_cols, label_cols
    except Exception as e:
        logger.error("Error preparing data for CGAN.")
        raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        logger.info("Starting CGAN script...")

        input_csv = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_feature_engineered.csv"
        if not os.path.exists(input_csv):
            raise FileNotFoundError(f"{input_csv} not found in working directory.")

        df = pd.read_csv(input_csv)
        logger.info(f"Loaded input CSV: {input_csv} with shape {df.shape}")

        # Prepare data and labels for CGAN (auto-detect label column)
        data_np, labels_np, feature_cols, label_cols = _prepare_data_for_cgan(df, feature_cols=None, label_col='label')

        input_dim = data_np.shape[1]
        label_dim = labels_np.shape[1]

        # init CGAN
        cgan = ConditionalGANModel(input_dim=input_dim, label_dim=label_dim, noise_dim=64, lr=2e-4)

        # Train CGAN (use modest epochs for quick runs; increase for production)
        cgan.fit(data_np, labels_np, epochs=200, batch_size=512)

        # Example: generate 1000 samples conditioned on the *first* label category
        # create a label vector that picks the first class (one-hot)
        cond_label = np.zeros((label_dim,), dtype=np.float32)
        cond_label[0] = 1.0
        n_gen = 1000
        synthetic = cgan.generate(n=n_gen, label_vector=cond_label)

        # Convert to DataFrame with same feature column names
        synthetic_df = pd.DataFrame(synthetic, columns=feature_cols)
        out_csv = "/media/shrav/New Volume/Mega_Project/TrustCast/data/augmentation/synthetic_cgan.csv"
        synthetic_df.to_csv(out_csv, index=False)
        logger.info(f"Synthetic CGAN data saved to {out_csv}")

        # Save model weights
        cgan.save("/media/shrav/New Volume/Mega_Project/TrustCast/model/cgan_generator.pt", "/media/shrav/New Volume/Mega_Project/TrustCast/model/cgan_discriminator.pt")

        logger.info("CGAN script finished successfully.")

    except Exception as e:
        logger.error("CGAN script failed.")
        raise CustomException(e, sys)
