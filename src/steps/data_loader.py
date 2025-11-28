import pandas as pd # type: ignore
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException
import sys
import time 

class DataLoader:
    def __init__(self, file_path):
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
    def load_data(self) -> pd.DataFrame:

        try:
            self.data = pd.read_csv(self.file_path)
            logger.info(f"Data Loaded sucessfully file path: {self.file_path}")
            return self.data
        except Exception as e:
            logger.error("Error in data loading process")
            raise CustomException(e, sys)
        
    def get_data(self) -> pd.DataFrame:
        try: 
            if self.data is not None:
                logger.info("Get data from data loader")
                return self.data
        

        except Exception as e:
            logger.erro("Error during gettin data ")
            raise CustomException(e, sys)
        
# if __name__=="__main__":
#     file_path = '/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network.csv'
#     obj = DataLoader(file_path)
#     obj.load_data()
#     data = obj.get_data()
#     print(data.head())