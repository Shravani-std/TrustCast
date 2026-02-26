import pandas as pd #type:ignore
import numpy as np #type:ignore
import sys
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class TrustEngine:

    @staticmethod
    def normalize(series):
        return (series - series.min()) / (series.max() - series.min() + 1e-6)

    def apply(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Applying Trust Engine...")

            traffic_score = 1 - abs(df["byte_ratio"] - 1)
            temporal_score = 1 - self.normalize(df["burstiness"])
            protocol_score = 1 - self.normalize(df["ct_state_ttl"])

            df["Trust_Score"] = (
                0.4 * traffic_score +
                0.3 * temporal_score +
                0.3 * protocol_score
            )

            df["Trust_Score"] = df["Trust_Score"].clip(0, 1)

            logger.info("Trust scoring completed.")
            return df

        except Exception as e:
            raise CustomException(e, sys)