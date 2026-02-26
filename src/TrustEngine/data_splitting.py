import pandas as pd #type:ignore
import sys
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class DataSplitter:

    def split(self, df: pd.DataFrame):

        try:
            df = df.sort_values("Stime").reset_index(drop=True)

            train_end = int(len(df) * 0.7)
            val_end = int(len(df) * 0.85)

            train = df.iloc[:train_end].copy()
            val = df.iloc[train_end:val_end].copy()
            test = df.iloc[val_end:].copy()

            # Drop timestamps after split
            drop_cols = ["Stime", "Ltime", "srcip", "dstip"]

            for dataset in [train, val, test]:
                dataset.drop(columns=drop_cols, errors="ignore", inplace=True)

            logger.info("Time-based split completed.")
            return train, val, test

        except Exception as e:
            raise CustomException(e, sys)