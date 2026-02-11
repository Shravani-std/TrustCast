import pandas as pd # type: ignore
from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException
import sys
import time 

class DataLoader:
    def __init__(self, file_paths):
        self.file_paths = file_paths
        self.dataframes = []
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
            for path in self.file_paths:
                self.data = pd.read_csv(path)
                self.dataframes.append(self.data)
                print(f"{path} Loaded Successfully")

            logger.info(f"All Datasets Loaded sucessfully file path: {self.file_paths}")

            # return self.data
        except Exception as e:
            logger.error("Error in data loading process")
            raise CustomException(e, sys)

    def combine_datasets(self)->pd.DataFrame:
        try:
            self.data = pd.concat(self.dataframes, axis=0, ignore_index=True)
            print("Datasets combined Successfully")
            return self.data
        except Exception as e:
            logger.error("Error while combining datasets")
            raise CustomException(e,sys)
                
    def save_new_dataset(self, output_path:str) ->None:
        try:
            if self.data is None:
                raise ValueError("Data is not present")
            self.data.to_csv(output_path, index=False)
            print(f"combined dataset saved at {output_path}")
            logger.info("Combined dataset saved successfully ")

        except Exception as e:
            logger.error("Error while in Saving new daatset")
            raise CustomException(e,sys)
        
    def get_data(self) -> pd.DataFrame:
        try: 
            if self.data is not None:
                logger.info("Get data from data loader")
                return self.data.head()
        
    
        except Exception as e:
            logger.erro("Error during gettin data ")
            raise CustomException(e, sys)
    
# if __name__=="__main__":
#     file_paths = ['D:\\AI\\TrustCast\\data\\UNSW_1.csv',
#                   'D:\\AI\\TrustCast\\data\\UNSW_2.csv',
#                   'D:\\AI\\TrustCast\\data\\UNSW_3.csv']
#     output_path ='D:\\AI\\TrustCast\\data\\UNSW_combined.csv'
#     obj = DataLoader(file_paths)

#     obj.load_data()
#     combined_data = obj.combine_datasets()
#     print("Shape of new Dataset: ",combined_data.shape)
#     # print(combined_data.head())
#     obj.save_new_dataset(output_path)
#     data = obj.get_data()
#     print(data)