import pandas as pd  # type: ignore
import sys
from sklearn.model_selection import train_test_split
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class DataSplitter:

    def split(self, df):

        try:
            logger.info("Starting stratified data split...")

            # ------------------------------
            # 70% Train, 15% Val, 15% Test
            # ------------------------------
            train_df, temp_df = train_test_split(
                df,
                test_size=0.3,
                stratify=df["Label"],
                random_state=42
            )

            val_df, test_df = train_test_split(
                temp_df,
                test_size=0.5,
                stratify=temp_df["Label"],
                random_state=42
            )

            logger.info("Data split completed successfully.")

            return train_df, val_df, test_df

        except Exception as e:
            raise CustomException(e, sys)


# --------------------------------------------------
# Debug run
 # --------------------------------------------------
# if __name__ == "__main__":

#     df = pd.read_csv("D:\\AI\\TrustCast\\data\\UNSW_1.csv")

#     splitter = DataSplitter()
#     train_df, val_df, test_df = splitter.split(df)

#     print("Train distribution:")
#     print(train_df["Label"].value_counts())

#     print("\nVal distribution:")
#     print(val_df["Label"].value_counts())

#     print("\nTest distribution:")
#     print(test_df["Label"].value_counts())

#     print("\nFull dataset distribution:")
#     print(df["Label"].value_counts())

#     print("\nAttack index range:")
#     print("Min:", df[df["Label"] == 1].index.min())
#     print("Max:", df[df["Label"] == 1].index.max())