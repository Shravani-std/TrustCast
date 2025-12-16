from abc import ABC, abstractmethod
from typing import List
import sys
import numpy as np # type: ignore
import pandas as pd # type: ignore
from sklearn.preprocessing import OneHotEncoder, LabelEncoder, StandardScaler
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class CategoricalEncoder:
    def __init__(self, method="onehot", categories='auto'):
        self.method = method
        self.categories = categories
        self.encoders = {}

    def fit(self, df: pd.DataFrame, columns: List[str]):
        try:
            logger.info(f"Fitting CategoricalEncoder with method={self.method} on columns={columns}")
            for col in columns:
                if self.method == "onehot":
                    self.encoders[col] = OneHotEncoder(sparse_output=False, drop='first', categories=self.categories)
                elif self.method == "ordinal":
                    self.encoders[col] = LabelEncoder()
                else:
                    raise ValueError(f"Unsupported encoding method: {self.method}")
                self.encoders[col].fit(df[[col]] if self.method == "onehot" else df[col])
            logger.info("CategoricalEncoder fitting completed successfully.")
        except Exception as e:
            logger.error("Error while fitting CategoricalEncoder.")
            raise CustomException(e, sys)

    def transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        try:
            logger.info(f"Transforming dataframe using method={self.method} on columns={columns}")
            df_encoded = df.copy()
            for col in columns:
                if self.method == "onehot":
                    transformed = self.encoders[col].transform(df[[col]])
                    transformed_df = pd.DataFrame(
                        transformed,
                        columns=self.encoders[col].get_feature_names_out([col]),
                        index=df.index
                    )
                    df_encoded = pd.concat([df_encoded.drop(columns=[col]), transformed_df], axis=1)
                    logger.info(f"One-hot encoding applied to column: {col}")
                else:
                    df_encoded[col] = self.encoders[col].transform(df[col].astype(str))
                    logger.info(f"Label encoding applied to column: {col}")
            logger.info("CategoricalEncoder transformation completed successfully.")
            return df_encoded
        except Exception as e:
            logger.error("Error while transforming dataframe in CategoricalEncoder.")
            raise CustomException(e, sys)

    def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        self.fit(df, columns)
        return self.transform(df, columns)


class OutlierHandler:
    def __init__(self, multiplier: float = 1.5):
        self.multiplier = multiplier
        self.medians = {}
        self.iqr_bounds = {}
        self.outliers = pd.DataFrame()

    def fit(self, df: pd.DataFrame, columns: List[str]):
        try:
            logger.info(f"Fitting OutlierHandler on columns={columns} with multiplier={self.multiplier}")
            for col in columns:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                self.medians[col] = df[col].median()
                self.iqr_bounds[col] = (q1 - self.multiplier * iqr, q3 + self.multiplier * iqr)
            logger.info("OutlierHandler fitting completed successfully.")
        except Exception as e:
            logger.error("Error while fitting OutlierHandler.")
            raise CustomException(e, sys)

    def transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        try:
            logger.info(f"Transforming dataframe with OutlierHandler on columns={columns}")
            df_copy = df.copy()
            for col in columns:
                outliers = df_copy[(df_copy[col] < self.iqr_bounds[col][0]) | (df_copy[col] > self.iqr_bounds[col][1])]
                self.outliers = pd.concat([self.outliers, outliers])
                df_copy[col] = np.where(
                    (df_copy[col] < self.iqr_bounds[col][0]) | (df_copy[col] > self.iqr_bounds[col][1]),
                    self.medians[col],
                    df_copy[col]
                )
                logger.info(f"Outlier handling applied to column: {col}, replaced {outliers.shape[0]} outliers")
            logger.info("OutlierHandler transformation completed successfully.")
            return df_copy
        except Exception as e:
            logger.error("Error while transforming dataframe in OutlierHandler.")
            raise CustomException(e, sys)

    def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        self.fit(df, columns)
        return self.transform(df, columns)


class DataPreprocessor:
    """ETL class for the network dataset"""

    def __init__(self):
        self.scaler = StandardScaler()
        self.categorical_encoder = CategoricalEncoder(method="onehot")
        self.label_encoder = CategoricalEncoder(method="ordinal")
        self.outlier_handler = OutlierHandler(multiplier=1.5)

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting preprocessing of dataset...")

            drop_cols = [
                'service', 'missed_bytes', 'src_ip_bytes', 'dst_ip_bytes',
                'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected',
                'ssl_version','ssl_resumed', 'ssl_established',
                'http_trans_depth', 'http_method', 'http_uri', 'http_version', 'http_user_agent',
                'http_orig_mime_types', 'http_resp_mime_types', 'http_request_body_len', 'http_response_body_len'
            ]
            df = df.drop(columns=drop_cols, errors='ignore')
            logger.info(f"Dropped columns: {drop_cols}")

            # Separate categorical and numerical columns 
            categorical_cols = df.select_dtypes(include='object').columns.tolist()
            numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
            logger.info(f"Categorical columns: {categorical_cols}")
            logger.info(f"Numerical columns: {numerical_cols}")

            #Scale numerical columns
            df[numerical_cols] = self.scaler.fit_transform(df[numerical_cols])
            logger.info("Numerical columns scaled successfully.")

            # --- One-hot encode small-cardinality categorical columns ---
            small_cat_features = ['proto', 'conn_state', 'type']
            df = self.categorical_encoder.fit_transform(df, small_cat_features)

            #Label encode large-cardinality categorical columns ---
            large_cat_features = ['src_ip', 'dst_ip', 'dns_query', 'ssl_cipher', 'ssl_subject', 'ssl_issuer',
                                  'weird_name', 'weird_addl', 'weird_notice']
            df = self.label_encoder.fit_transform(df, large_cat_features)

            logger.info("Preprocessing completed successfully.")
            return df

        except Exception as e:
            logger.error("Error during preprocessing in DataPreprocessor.")
            raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        logger.info("Starting ETL process for network dataset...")

     
        input_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network.csv"
        df = pd.read_csv(input_file)
        logger.info(f"Loaded dataset from {input_file} with shape {df.shape}")

        preprocessor = DataPreprocessor()
        df_processed = preprocessor.preprocess(df)
        logger.info(f"Preprocessed dataset shape: {df_processed.shape}")

     
        output_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/dataset_processed.csv"
        df_processed.to_csv(output_file, index=False)
        logger.info(f"Processed dataset saved at {output_file}")

    except Exception as e:
        logger.error("ETL process failed.")
        raise CustomException(e, sys)
