from typing import List
import sys
import torch # type: ignore
import torch.nn as nn # type: ignore
import numpy as np # type: ignore
import pandas as pd # type: ignore

from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class _VAE(nn.Module):
    """Internal PyTorch VAE model used for synthetic data generation"""

    def __init__(self, input_dim: int, latent_dim: int = 16):
        super(_VAE, self).__init__()

        # Encoder network
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU()
        )

        self.mu = nn.Linear(32, latent_dim)
        self.logvar = nn.Linear(32, latent_dim)

        # Decoder network
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, input_dim)
        )

    def encode(self, x):
        h = self.encoder(x)
        return self.mu(h), self.logvar(h)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z):
        return self.decoder(z)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        reconstructed = self.decode(z)
        return reconstructed, mu, logvar


class VAEModel:
    """Wrapper for training and generating synthetic data using VAE"""

    def __init__(self, input_dim: int, latent_dim: int = 16, lr: float = 1e-3):
        try:
            logger.info("Initializing VAE Model...")
            self.model = _VAE(input_dim=input_dim, latent_dim=latent_dim)
            self.optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)
            self.criterion = nn.MSELoss()
            logger.info("VAE Model initialized successfully.")
        except Exception as e:
            logger.error("Error initializing VAE.")
            raise CustomException(e, sys)

    def fit(self, data: np.ndarray, epochs: int = 20):
        try:
            logger.info(f"Training VAE for {epochs} epochs...")
            data_tensor = torch.tensor(data, dtype=torch.float32)

            for epoch in range(epochs):
                reconstructed, mu, logvar = self.model(data_tensor)
                mse_loss = self.criterion(reconstructed, data_tensor)
                kl_loss = -0.5 * torch.mean(1 + logvar - mu.pow(2) - logvar.exp())
                loss = mse_loss + kl_loss

                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()

                if epoch % 5 == 0:
                    logger.info(f"Epoch {epoch} | Loss: {loss.item():.4f}")

            logger.info("VAE training completed successfully.")

        except Exception as e:
            logger.error("Error during VAE training.")
            raise CustomException(e, sys)

    def generate(self, n: int = 1000) -> np.ndarray:
        try:
            logger.info(f"Generating {n} synthetic samples using VAE...")
            latent_dim = self.model.mu.out_features
            z = torch.randn(n, latent_dim)
            synthetic = self.model.decode(z).detach().numpy()
            logger.info("Synthetic data generated successfully.")
            return synthetic
        except Exception as e:
            logger.error("Error generating synthetic samples in VAE.")
            raise CustomException(e, sys)

    def save(self, path: str):
        try:
            torch.save(self.model.state_dict(), path)
            logger.info(f"VAE model saved at {path}")
        except Exception as e:
            raise CustomException(e, sys)

    def load(self, path: str):
        try:
            self.model.load_state_dict(torch.load(path))
            logger.info(f"VAE model loaded from {path}")
        except Exception as e:
            raise CustomException(e, sys)
        
if __name__ == "__main__":
    try:
        logger.info("Running VAE generation module...")

        # Load dataset
        df = pd.read_csv("/media/shrav/New Volume/Mega_Project/TrustCast/data/train_feature_engineered.csv")
        logger.info(f"Loaded dataset with shape {df.shape}")

        # Convert ONLY numeric columns
        numeric_df = df.select_dtypes(include=[np.number])
        data = numeric_df.values

        # Init + Train VAE
        vae = VAEModel(input_dim=data.shape[1])
        vae.fit(data, epochs=20)

        # Generate synthetic samples
        synthetic = vae.generate(n=5000)

        # Save synthetic dataset
        output_path = "/media/shrav/New Volume/Mega_Project/TrustCast/data/augmentation/synthetic_vae.csv"
        pd.DataFrame(synthetic).to_csv(output_path, index=False)
        logger.info(f"Synthetic VAE data saved at {output_path}")

        # Save trained VAE model weights
        model_path = "/media/shrav/New Volume/Mega_Project/TrustCast/model/vae_model.pth"
        vae.save(model_path)
        logger.info(f"VAE model saved at {model_path}")

    except Exception as e:
        logger.error("VAE main execution failed.")
        raise CustomException(e, sys)
