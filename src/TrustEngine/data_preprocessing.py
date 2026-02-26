import pandas as pd #type:ignore
import sys
from sklearn.preprocessing import OneHotEncoder #type:ignore
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class DataPreprocessing:

    def __init__(self):
        self.ohe = OneHotEncoder(
            sparse_output=False,
            handle_unknown="ignore"
        )

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting preprocessing...")

            # Drop attack_cat
            df = df.drop(columns=["attack_cat"], errors="ignore")

            # Clean service
            df["service"] = df["service"].fillna("unknown")

            # One-hot encode small categoricals
            cat_cols = ["proto", "state", "service"]

            encoded = self.ohe.fit_transform(df[cat_cols])
            encoded_df = pd.DataFrame(
                encoded,
                columns=self.ohe.get_feature_names_out(cat_cols),
                index=df.index
            )

            df = pd.concat(
                [df.drop(columns=cat_cols), encoded_df],
                axis=1
            )

            logger.info("Preprocessing completed.")
            return df

        except Exception as e:
            raise CustomException(e, sys)