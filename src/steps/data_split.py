from typing import Tuple
import os
import sys

import pandas as pd  # type: ignore
from sklearn.model_selection import train_test_split # type: ignore

from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class DataSplitter:
    def __init__(
        self,
        target_col: str = "trust_score",
        test_ratio: float = 0.30,
        val_ratio_in_temp: float = 0.50,
        random_state: int = 42,
        stratify: bool = True,
    ):
        self.target_col = target_col
        self.test_ratio = test_ratio
        self.val_ratio_in_temp = val_ratio_in_temp
        self.random_state = random_state
        self.stratify = stratify

    def split(
        self, df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        try:
            logger.info("Starting train/test/val split...")

            if self.target_col in df.columns:
                logger.info(
                    f"Using '{self.target_col}' as target column for supervised split."
                )

                X = df.drop(columns=[self.target_col])
                y = df[self.target_col]

                # First split: Train (70%), Temp (30%)
                stratify_y = y if self.stratify else None

                X_train, X_temp, y_train, y_temp = train_test_split(
                    X,
                    y,
                    test_size=self.test_ratio,
                    random_state=self.random_state,
                    stratify=stratify_y,
                )

                # Second split: Temp → Val (15%) & Test (15%)
                stratify_y_temp = y_temp if self.stratify else None

                X_val, X_test, y_val, y_test = train_test_split(
                    X_temp,
                    y_temp,
                    test_size=self.val_ratio_in_temp,
                    random_state=self.random_state,
                    stratify=stratify_y_temp,
                )

                train_df = X_train.copy()
                train_df[self.target_col] = y_train

                val_df = X_val.copy()
                val_df[self.target_col] = y_val

                test_df = X_test.copy()
                test_df[self.target_col] = y_test

            else:
                logger.warning(
                    f"Target column '{self.target_col}' not found. "
                    f"Falling back to unsupervised row-wise split."
                )

                train_df, temp_df = train_test_split(
                    df,
                    test_size=self.test_ratio,
                    random_state=self.random_state,
                )

                val_df, test_df = train_test_split(
                    temp_df,
                    test_size=self.val_ratio_in_temp,
                    random_state=self.random_state,
                )

            logger.info(
                f"Split complete. "
                f"Train shape: {train_df.shape}, "
                f"Val shape: {val_df.shape}, "
                f"Test shape: {test_df.shape}"
            )

            return train_df, val_df, test_df

        except Exception as e:
            logger.error("Error occured during train/val/test split")
            raise CustomException(e, sys)

if __name__ == "__main__":
    try:
        logger.info("===== Data Split Step Started =====")

        # ==== Absolute Paths (no os.path used) ====
        input_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/dataset_processed.csv"
        train_path = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train.csv"
        val_path = "/media/shrav/New Volume/Mega_Project/TrustCast/data/val.csv"
        test_path = "/media/shrav/New Volume/Mega_Project/TrustCast/data/test.csv"

        # ==== Load dataset (with clean error handling) ====
        try:
            df = pd.read_csv(input_file)
        except FileNotFoundError as e:
            logger.error(f"Input dataset not found: {input_file}")
            # Wrap and re-raise as CustomException
            raise CustomException(e, sys)

        logger.info(
            f"Loaded engineered dataset from {input_file} with shape {df.shape}"
        )

        # ==== Perform split ====
        splitter = DataSplitter(
            target_col="trust_score",  # change this to your real label if needed
            test_ratio=0.30,
            val_ratio_in_temp=0.50,
            random_state=42,
            stratify=False,  # keep False for continuous target like trust_score
        )

        train_df, val_df, test_df = splitter.split(df)

        # ==== Save outputs ====
        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

        logger.info(
            "Saved splits to:\n"
            f"  Train: {train_path} ({train_df.shape})\n"
            f"  Val:   {val_path} ({val_df.shape})\n"
            f"  Test:  {test_path} ({test_df.shape})"
        )

        print("Train head:\n", train_df.head())
        print("Val head:\n", val_df.head())
        print("Test head:\n", test_df.head())

        logger.info("===== Data Split Step Finished Successfully =====")

    except Exception as e:
        logger.error("Data split step failed.")
        raise CustomException(e, sys)
