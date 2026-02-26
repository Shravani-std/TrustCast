import pandas as pd  # type: ignore
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException
import sys
import time


class DataLoader:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.data = None

    @staticmethod
    def timed(func):
        """Decorator for execution time logger"""
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            end = time.time()

            logger.info(f"'{func.__name__}' executed in {end - start:.4f}s")
            print(f"'{func.__name__}' executed in {end - start:.4f}s")
            return result
        return wrapper

    @timed
    def load(self) -> pd.DataFrame:
        try:
            # IMPORTANT: low_memory=False prevents dtype warning
            self.data = pd.read_csv(self.file_path, low_memory=False)

            logger.info(f"Dataset loaded successfully: {self.data.shape}")
            print(f"Dataset loaded successfully: {self.data.shape}")

            return self.data

        except Exception as e:
            logger.error("Error in data loading process")
            raise CustomException(e, sys)