import pandas as pd #type:ignore
import sys
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException


class DataLoader:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def load(self) -> pd.DataFrame:
        try:
            df = pd.read_csv(self.file_path)
            logger.info(f"Dataset loaded successfully: {df.shape}")
            return df
        except Exception as e:
            raise CustomException(e, sys)