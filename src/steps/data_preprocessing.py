from abc import ABC, abstractmethod
from typing import List
import sys
import numpy as np # type: ignore
import pandas as pd # type: ignore
from sklearn.preprocessing import OneHotEncoder #type: ignore
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger

class DataPreprocessing:
    def __init__(self):
        self.ohe = OneHotEncoder(
            sparse_output=False,
            handle_unknown='ignore'
        )
    
    # Utility: Port Conversion
    @staticmethod
    #static method : does NOT need self.x does not ned to initialization of an instance
    def convert_port_to_int(x):
        try:
            if pd.isna(x):
                return -1
            if isinstance(x,str):
                x = x.strip()
                if x.startswith(("0x","0X")):
                    return int(x,16)
                if x.isdigit():
                    return int(x)
                return -1
            return int(x)
        except Exception:
            return -1
        
     # Step 1: Missing Value Handling

    def handle_missing(self, df:pd.DataFrame) ->pd.DataFrame:
        try:
            logger.info("handling Missing values...")
            if "attack_cat" in df.columns:
                df["attack_cat"] = df["attack_cat"].fillna("Normal")
            logger.info("Missing value handling Completed. ")
            return df
        
        except Exception as e:
            logger.error("Error in  handle_missing() ")
            raise CustomException(e,sys)

    # Step 2: Port Processing( converting ports different formate into interger using convert_port_to_int() function)
    def process_ports(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Processing port column...")

            df["sport"] = df["sport"].apply(self.convert_port_to_int)
            df["dsport"] = df["dsport"].apply(self.convert_port_to_int)

            logger.info("Port Conversion completed")

            return df
        except Exception as e:
            logger.error("Error in process_ports()")
            raise CustomException(e,sys)
        
        # Step 3: Service Cleaning
    def clean_service(self, df:pd.DataFrame)->pd.DataFrame:
        try:
            logger.info("Cleaning service column...")
            df["service"] = df["service"].replace("-", "unknown_service")
            logger.info("Service cleaning completed.")

            return df
        except Exception as e:
            logger.error("Error in clean_service() ")
            raise CustomException(e,sys)

        # Step 4: Feature Engineering + Encoding

    def encode_categorical(self, df:pd.DataFrame)->pd.DataFrame:
        try:
            logger.info("Starting categorical feature engineering...")

            # service Binary
            df["is_service_unknown"] = (
                df["service"].isin(["unknown_service"])
            ).astype(int)

            # port bucketing
            def bucket(port):
                if port == -1:
                    return "unknown"
                elif port <= 1023:
                    return "well_known"
                elif port <= 49151:
                    return "registered"
                else:
                    return "dynamic"
                
            df["sport_bucket"] = df["sport"].apply(bucket)
            df["dsport_bucket"] = df["dsport"].apply(bucket)


            small_cat_features = [
                "state",
                "sport_bucket",
                "dsport_bucket",
                "service"
            ]

            existing_cols =[c for c in small_cat_features if c in df.columns]
            encoded = self.ohe.fit_transform(df[existing_cols])

            encoded_df = pd.DataFrame(
                encoded,
                columns=self.ohe.get_feature_names_out(existing_cols),
                index=df.index
            )

#dropeed unwanted cols which are already encoded
            df = pd.concat(
                [df.drop(columns=existing_cols), encoded_df]
            )

             # Protocol grouping
            df["proto_group"] = df["proto"].apply(
                lambda p: p if p in ("tcp", "udp", "icmp") else "other"
            )
            proto_domain = pd.get_dummies(
                df["proto_group"],

                prefix="proto",
                dtype=int
            )
            df = pd.concat([df, proto_domain], axis=1)
            df["is_tcp"] = (df["proto"] == "tcp").astype(int)
            df["is_udp"] = (df["proto"] == "udp").astype(int)
            df["is_icmp"] = (df["proto"] == "icmp").astype(int)
            df["is_other_proto"] = (
                (df["is_tcp"] + df["is_udp"] + df["is_icmp"]) == 0
            ).astype(int)
            df = df.drop(columns=["proto", "proto_group", "attack_cat"], errors="ignore")
            logger.info("Categorical feature engineering completed.")
            return df
        except Exception as e:
            logger.error(" Error in encode_categorical() " )
            raise CustomException(e,sys)

    # Step 5: IP Encoding
    def encode_ip(self, df:pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Encoding IP Addresses...")



            # Encode Src ip
            if "srcip" in df.columns:
                src_split = (
                    df["srcip"].fillna("0.0.0.0").str.split(".", expand=True).astype(int)
                )
            if src_split.shape[1] == 4:
                    src_split = src_split.apply(pd.to_numeric, errors="coerce").fillna(-1).astype(int)

                    df["srcip_network_class_identifier"] = src_split[0]
                    df["srcip_network_portion"] = src_split[1]
                    df["srcip_subnet_portion"] = src_split[2]
                    df["srcip_host_portion"] = src_split[3]

                    logger.info("Encoding of srcip completed successfully.")
            else:
                    logger.warning("srcip format invalid. Skipping srcip encoding.")

            # Encode Destination IP
            if "dstip" in df.columns:
                dst_split = (
                    df["dstip"]
                    .astype(str)
                    .str.split(".", expand=True)
                )

                if dst_split.shape[1] == 4:
                    dst_split = dst_split.apply(pd.to_numeric, errors="coerce").fillna(-1).astype(int)

                    df["dstip_network_class_identifier"] = dst_split[0]
                    df["dstip_network_portion"] = dst_split[1]
                    df["dstip_subnet_portion"] = dst_split[2]
                    df["dstip_host_portion"] = dst_split[3]

                    logger.info("Encoding of dstip completed successfully.")
                else:
                    logger.warning("dstip format invalid. Skipping dstip encoding.")

            # Drop original IP columns
            df.drop(columns=["srcip", "dstip"], errors="ignore", inplace=True)

            logger.info("IP categorical encoding completed successfully.")
            return df

        except Exception as e:
            logger.exception("Error in encode_ip.")
            raise CustomException(e, sys)




# Full Pipeline
    def preprocess(self, df:pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting full preprocessing pipeline...")
            df = self.handle_missing(df)
            df = self.process_ports(df)
            df = self.clean_service(df)
            df = self.encode_categorical(df)
            df = self.encode_ip(df)

            logger.info("Preprocessing pipeline completed successfully.")
            return df
        except Exception as e:
            logger.error("Error in Preprocessing pipeline. ")
            raise CustomException(e,sys)
    


if __name__ == "__main__":
    try:
        logger.info("Starting ETL process for TrustCast dataset...")

        file_path = "D:\\AI\\TrustCast\\data\\UNSW_1.csv"
        df = pd.read_csv(file_path)
        logger.info(f"Dataset loaded successfully with shape {df.shape}")

        data_process = DataPreprocessing()
        df_processed = data_process.preprocess(df)

        logger.info(f"Processed dataset shape: {df_processed.shape}")

        output_path = "D:\\AI\\TrustCast\\data\\UNSW_combined_processed.csv"
        df_processed.to_csv(output_path, index=False)

        logger.info(f"Processed dataset saved at {output_path}")

    except Exception as e:
        logger.error("ETL process failed.")
        raise CustomException(e, sys)

# def understanding_Data(data: pd.DataFrame):
#     try:
#         column_names = data.columns.tolist()
#         logger.info(f"Column Names : {column_names}")
#         for col in column_names:
#             print(f"Columns: {col}")
#             print(f"Datatype of {col}: {data[col].dtype}")
#             print(f"Unique values in {col}: {data[col].unique()}")
#             print("\n")
#         categorical_cols = data.select_dtypes(include='object').columns
#         numerical_cols = data.select_dtypes(include= ['int64', 'float64']).columns
#         print(f"Categorical Columns: {categorical_cols}")
#         print(f"Numerical Columns: {numerical_cols}")

#     except Exception as e:
#         logger.error("Error in data processing")
#         raise CustomException(e,sys)
# def missing_Values(data: pd.DataFrame):
#     try:
#         missing_var = data.isnull().sum()
#         logger.info("Missing values calculated")
#         return missing_var
#     except Exception as e:
#         logger.error('Error')
#         raise CustomException(e,sys)
# def handling_missing_values(data: pd.DataFrame):
#     try:
#         missing_val_col = missing_Values(data)

#         for col in missing_val_col.index:
#             if col == 'attack_cat':
#                 data['attack_cat'] = data['attack_cat'].fillna('Normal')

#         logger.info("Missing values handled successfully")
#         return data

#     except Exception as e:
#         logger.error("Error in handling missing values")
#         raise CustomException(e, sys)
    
# def convert_port_to_int(x):
#     """
#     Converts mixed-format port values to integer.
#     Handles decimal, hex, and missing values.
#     """
#     if pd.isna(x):
#         return -1

#     if isinstance(x, str):
#         x = x.strip()

#         # Hexadecimal port
#         if x.startswith(("0x", "0X")):
#             try:
#                 return int(x, 16)
#             except ValueError:
#                 return -1

#         # Decimal string
#         if x.isdigit():
#             return int(x)

#         return -1

#     # Already numeric
#     try:
#         return int(x)
#     except Exception:
#         return -1

# def service_handling(data:pd.DataFrame):
#     try:
#         data['service'] = data['service'].replace("-", "unknown_service")
#         logger.info("Adding unknown_service instead of '-' " )
#         return data
#     except Exception as e:
#         logger.error("Error")
#         raise CustomException(e,sys)

# def categorical_encoding(data: pd.DataFrame):
#     try:
#         # --------------------------------------------------
#         # 1. Service-based binary feature
#         # --------------------------------------------------
#         data["is_service_unknown"] = (
#             data["service"].isin(["unknown_service", "unknown_tcpudp_service"])
#         ).astype(int)

#         # --------------------------------------------------
#         # 2. Port bucketing (semantic, NOT conversion)
#         # --------------------------------------------------
#         def bucket_ports(port):
#             if port == -1:
#                 return "unknown"
#             elif port <= 1023:
#                 return "well_known"
#             elif port <= 49151:
#                 return "registered"
#             else:
#                 return "dynamic"

#         data["sport_bucket"] = data["sport"].apply(bucket_ports)
#         data["dsport_bucket"] = data["dsport"].apply(bucket_ports)

#         # --------------------------------------------------
#         # 3. One-hot encode SMALL categorical features
#         # --------------------------------------------------
#         small_cat_features = [
#             "state",
#             "sport_bucket",
#             "dsport_bucket",
#             "service"
#         ]

#         ohe = OneHotEncoder(
#             sparse_output=False,
#             handle_unknown="ignore"
#         )

#         encoded_features = ohe.fit_transform(data[small_cat_features])

#         encoded_df = pd.DataFrame(
#             encoded_features,
#             columns=ohe.get_feature_names_out(small_cat_features),
#             index=data.index
#         )

#         data = pd.concat(
#             [data.drop(columns=small_cat_features), encoded_df],
#             axis=1
#         )

#         # --------------------------------------------------
#         # 4. Protocol grouping
#         # --------------------------------------------------
#         def proto_group(p):
#             if p in ("tcp", "udp", "icmp"):
#                 return p
#             else:
#                 return "other"

#         data["proto_group"] = data["proto"].apply(proto_group)

#         # --------------------------------------------------
#         # 5. One-hot encode grouped protocol
#         # --------------------------------------------------
#         proto_dummies = pd.get_dummies(
#             data["proto_group"],
#             prefix="proto",
#             dtype=int
#         )

#         data = pd.concat([data, proto_dummies], axis=1)

#         # --------------------------------------------------
#         # 6. Explicit binary protocol flags
#         # --------------------------------------------------
#         data["is_tcp"] = (data["proto"] == "tcp").astype(int)
#         data["is_udp"] = (data["proto"] == "udp").astype(int)
#         data["is_icmp"] = (data["proto"] == "icmp").astype(int)

#         data["is_other_proto"] = (
#             (data["is_tcp"] + data["is_udp"] + data["is_icmp"]) == 0
#         ).astype(int)

#         # --------------------------------------------------
#         # 7. Drop raw high-cardinality columns
#         # --------------------------------------------------
#         data = data.drop(columns=["proto", "proto_group", "attack_cat"])

#         logger.info("Categorical encoding completed successfully")
#         return data

#     except Exception as e:
#         logger.error("Error in categorical encoding")
#         raise CustomException(e, sys)
# def categoricalEncoding_ip(data: pd.DataFrame):
#     try:
#         encode_data_src = data['srcip']
#         encode_data_dst = data['dstip']

#         # Splitting Ipv4 address into 4 features
#         # 1.Network class identifire
#         # 2.Network Portion (Organizationa network)
#         # 3.Subnet Portion
#         # 4.Host 
#         data[["octet_1", "octet_2", "octet_3", "octet_4"]] = encode_data_src.str.split(".", expand=True)
#         data[["octet_1", "octet_2", "octet_3", "octet_4"]] =  data[["octet_1", "octet_2", "octet_3", "octet_4"]].astype(int)
#         logger.info("Encoding of srcip completed! ")
#         data = data.rename(columns={
#             "octet_1": "srcip_network_class_identifier",
#             "octet_2": "srcip_network_portion",
#             "octet_3": "srcip_subnet_portion",
#             "octet_4": "srcip_host_portion"
#         })
#         data[["octet1", "octet2", "octet3", "octet4"]] = encode_data_dst.str.split(".", expand=True)
#         data[["octet1", "octet2", "octet3", "octet4"]] =  data[["octet_1", "octet_2", "octet_3", "octet_4"]].astype(int)
#         logger.info("Encoding of dstip completed! ")
        
        
#         data = data.rename(columns={
#             "octet1": "dstip_network_class_identifier",
#             "octet2": "dstip_network_portion",
#             "octet3": "dstip_subnet_portion",
#             "octet4": "dstip_host_portion"
#         })
#         data.drop(columns = ["srcip", "dstip"], inplace=True)
#         return data
#     except Exception as e:
#         logger.error("Error while doing categorical encoding of IP Addresses")
#         raise CustomException(e,sys)
# if __name__ == "__main__":
#     try:
#         file_path = 'D:\\AI\\TrustCast\\data\\UNSW_1.csv'
#         loader = DataLoader(file_path)
#         data = loader.load_data()

#         understanding_Data(data)

#         missing = missing_Values(data)
#         print("\nMissing values:\n", missing)

#         # -------------------------------
#         # Handle missing values
#         # -------------------------------
#         data = handling_missing_values(data)
#         print(
#             "After missing value filled (attack_cat nulls):",
#             data['attack_cat'].isnull().sum()
#         )

#         # -------------------------------
#         # Port conversion
#         # -------------------------------
#         data["sport"] = data["sport"].apply(convert_port_to_int)
#         data["dsport"] = data["dsport"].apply(convert_port_to_int)

#         print(
#             f"data type of ports {data['sport'].dtype} & {data['dsport'].dtype}"
#         )

#         # -------------------------------
#         # Service handling
#         # -------------------------------
#         data = service_handling(data)

#         print(
#             f"service contain '-' : {(data['service'] == '-').sum()}"
#         )

#         # -------------------------------
#         # Categorical encoding
#         # -------------------------------
#         data = categorical_encoding(data)

#         new_categorical_col = data.select_dtypes(include='object').columns
#         print(
#             "Remaining categorical columns:",
#             list(new_categorical_col)
#         )

#         categoricalEncoding_ip(data)

#     except Exception as e:
#         logger.error("data processing failed.")
#         raise CustomException(e, sys)

# class CategoricalEncoder:
#     def __init__(self, method="onehot", categories='auto'):
#         self.method = method
#         self.categories = categories
#         self.encoders = {}

#     def fit(self, df: pd.DataFrame, columns: List[str]):
#         try:
#             logger.info(f"Fitting CategoricalEncoder with method={self.method} on columns={columns}")
#             for col in columns:
#                 if self.method == "onehot":
#                     self.encoders[col] = OneHotEncoder(sparse_output=False, drop='first', categories=self.categories)

#                 else:
#                     raise ValueError(f"Unsupported encoding method: {self.method}")
                
#                 self.encoders[col].fit(df[[col]] if self.method == "onehot" else df[col])

#             logger.info("CategoricalEncoder fitting completed successfully.")
#         except Exception as e:
#             logger.error("Error while fitting CategoricalEncoder.")
#             raise CustomException(e, sys)

#     def transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
#         try:
#             logger.info(f"Transforming dataframe using method={self.method} on columns={columns}")
#             df_encoded = df.copy()
#             for col in columns:
#                 if self.method == "onehot":
#                     transformed = self.encoders[col].transform(df[[col]])
#                     transformed_df = pd.DataFrame(
#                         transformed,
#                         columns=self.encoders[col].get_feature_names_out([col]),
#                         index=df.index
#                     )
#                     df_encoded = pd.concat([df_encoded.drop(columns=[col]), transformed_df], axis=1)
#                     logger.info(f"One-hot encoding applied to column: {col}")
#                 else:
#                     df_encoded[col] = self.encoders[col].transform(df[col].astype(str))
#                     logger.info(f"Label encoding applied to column: {col}")
#             logger.info("CategoricalEncoder transformation completed successfully.")
#             return df_encoded
#         except Exception as e:
#             logger.error("Error while transforming dataframe in CategoricalEncoder.")
#             raise CustomException(e, sys)

#     def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
#         self.fit(df, columns)
#         return self.transform(df, columns)


# class OutlierHandler:
#     def __init__(self, multiplier: float = 1.5):
#         self.multiplier = multiplier
#         self.medians = {}
#         self.iqr_bounds = {}
#         self.outliers = pd.DataFrame()

#     def fit(self, df: pd.DataFrame, columns: List[str]):
#         try:
#             logger.info(f"Fitting OutlierHandler on columns={columns} with multiplier={self.multiplier}")
#             for col in columns:
#                 q1 = df[col].quantile(0.25)
#                 q3 = df[col].quantile(0.75)
#                 iqr = q3 - q1
#                 self.medians[col] = df[col].median()
#                 self.iqr_bounds[col] = (q1 - self.multiplier * iqr, q3 + self.multiplier * iqr)
#             logger.info("OutlierHandler fitting completed successfully.")
#         except Exception as e:
#             logger.error("Error while fitting OutlierHandler.")
#             raise CustomException(e, sys)

#     def transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
#         try:
#             logger.info(f"Transforming dataframe with OutlierHandler on columns={columns}")
#             df_copy = df.copy()
#             for col in columns:
#                 outliers = df_copy[(df_copy[col] < self.iqr_bounds[col][0]) | (df_copy[col] > self.iqr_bounds[col][1])]
#                 self.outliers = pd.concat([self.outliers, outliers])
#                 df_copy[col] = np.where(
#                     (df_copy[col] < self.iqr_bounds[col][0]) | (df_copy[col] > self.iqr_bounds[col][1]),
#                     self.medians[col],
#                     df_copy[col]
#                 )
#                 logger.info(f"Outlier handling applied to column: {col}, replaced {outliers.shape[0]} outliers")
#             logger.info("OutlierHandler transformation completed successfully.")
#             return df_copy
#         except Exception as e:
#             logger.error("Error while transforming dataframe in OutlierHandler.")
#             raise CustomException(e, sys)

#     def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
#         self.fit(df, columns)
#         return self.transform(df, columns)


# class DataPreprocessor:
#     """ETL class for the network dataset"""

#     def __init__(self):
#         self.scaler = StandardScaler()
#         self.categorical_encoder = CategoricalEncoder(method="onehot")
#         self.label_encoder = CategoricalEncoder(method="ordinal")
#         self.outlier_handler = OutlierHandler(multiplier=1.5)

#     def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
#         try:
#             logger.info("Starting preprocessing of dataset...")

#             drop_cols = [
#                 'service', 'missed_bytes', 'src_ip_bytes', 'dst_ip_bytes',
#                 'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected',
#                 'ssl_version','ssl_resumed', 'ssl_established',
#                 'http_trans_depth', 'http_method', 'http_uri', 'http_version', 'http_user_agent',
#                 'http_orig_mime_types', 'http_resp_mime_types', 'http_request_body_len', 'http_response_body_len'
#             ]
#             df = df.drop(columns=drop_cols, errors='ignore')
#             logger.info(f"Dropped columns: {drop_cols}")

#             # Separate categorical and numerical columns 
#             categorical_cols = df.select_dtypes(include='object').columns.tolist()
#             numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
#             logger.info(f"Categorical columns: {categorical_cols}")
#             logger.info(f"Numerical columns: {numerical_cols}")

#             #Scale numerical columns
#             df[numerical_cols] = self.scaler.fit_transform(df[numerical_cols])
#             logger.info("Numerical columns scaled successfully.")

#             # --- One-hot encode small-cardinality categorical columns ---
#             small_cat_features = ['proto', 'conn_state', 'type']
#             df = self.categorical_encoder.fit_transform(df, small_cat_features)

#             #Label encode large-cardinality categorical columns ---
#             large_cat_features = ['src_ip', 'dst_ip', 'dns_query', 'ssl_cipher', 'ssl_subject', 'ssl_issuer',
#                                   'weird_name', 'weird_addl', 'weird_notice']
#             df = self.label_encoder.fit_transform(df, large_cat_features)

#             logger.info("Preprocessing completed successfully.")
#             return df

#         except Exception as e:
#             logger.error("Error during preprocessing in DataPreprocessor.")
#             raise CustomException(e, sys)


# if __name__ == "__main__":
#     try:
#         logger.info("Starting ETL process for network dataset...")

     
#         input_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network.csv"
#         df = pd.read_csv(input_file)
#         logger.info(f"Loaded dataset from {input_file} with shape {df.shape}")

#         preprocessor = DataPreprocessor()
#         df_processed = preprocessor.preprocess(df)
#         logger.info(f"Preprocessed dataset shape: {df_processed.shape}")

     
#         output_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/dataset_processed.csv"
#         df_processed.to_csv(output_file, index=False)
#         logger.info(f"Processed dataset saved at {output_file}")

#     except Exception as e:
#         logger.error("ETL process failed.")
#         raise CustomException(e, sys)
