from typing import Tuple
import sys
import pandas as pd  # type: ignore

from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class DataSplitter:
    def __init__(
        self,
        target_col: str = "Label",
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
    ):
        self.target_col = target_col
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio

        if round(train_ratio + val_ratio + test_ratio, 2) != 1.0:
            raise ValueError("Train + Val + Test ratios must sum to 1.")

    def split(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        try:
            logger.info("Starting time-based train/validation/test split...")

            if "Stime" not in df.columns:
                raise ValueError("Stime column required for time-based split.")

            if self.target_col not in df.columns:
                raise ValueError(f"Target column '{self.target_col}' not found.")

            # Sort chronologically
            df = df.sort_values("Stime").reset_index(drop=True)

            total_len = len(df)

            train_end = int(total_len * self.train_ratio)
            val_end = int(total_len * (self.train_ratio + self.val_ratio))

            train_df = df.iloc[:train_end].copy()
            val_df = df.iloc[train_end:val_end].copy()
            test_df = df.iloc[val_end:].copy()

            logger.info(
                f"Time split complete - "
                f"Train: {train_df.shape}, "
                f"Val: {val_df.shape}, "
                f"Test: {test_df.shape}"
            )

            return train_df, val_df, test_df

        except Exception as e:
            logger.error("Error during time-based split.")
            raise CustomException(e, sys)


# =========================
# MAIN EXECUTION
# =========================
if __name__ == "__main__":
    try:
        logger.info("===== Data Split Step Started =====")

        input_file = "D:\\AI\\TrustCast\\data\\UNSW_feature_process_new.csv"
        train_path = "D:\\AI\\TrustCast\\data\\train.csv"
        val_path = "D:\\AI\\TrustCast\\data\\val.csv"
        test_path = "D:\\AI\\TrustCast\\data\\test.csv"

        # Load dataset
        df = pd.read_csv(input_file)
        logger.info(f"Loaded dataset with shape {df.shape}")

        # Initialize splitter
        splitter = DataSplitter(
            target_col="Label",
            train_ratio=0.70,
            val_ratio=0.15,
            test_ratio=0.15,
        )

        # Perform split
        train_df, val_df, test_df = splitter.split(df)

        # Save outputs
        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

        logger.info(
            f"Train shape: {train_df.shape}\n"
            f"Val shape: {val_df.shape}\n"
            f"Test shape: {test_df.shape}"
        )

        logger.info("===== Data Split Step Finished Successfully =====")

    except Exception as e:
        logger.error("Data split step failed.")
        raise CustomException(e, sys)