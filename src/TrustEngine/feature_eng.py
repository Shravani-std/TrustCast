import pandas as pd #type:ignore
import numpy as np #type:ignore
import sys
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException


class FeatureEngineering:

    def apply(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Applying feature engineering...")

            df["byte_ratio"] = df["sbytes"] / (df["dbytes"] + 1)
            df["packet_ratio"] = df["Spkts"] / (df["Dpkts"] + 1)
            df["load_diff"] = abs(df["Sload"] - df["Dload"])
            df["burstiness"] = df["Sjit"] / (df["Sintpkt"] + 1e-6)

            logger.info("Feature engineering done.")
            return df

        except Exception as e:
            raise CustomException(e, sys)