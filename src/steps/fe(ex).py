from typing import List
import sys
import numpy as np # type: ignore
import pandas as pd # type: ignore
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class FeatureEngineer:
    """Feature engineering for network dataset, including trust-related metrics"""

    def __init__(self):
        self.weights = {
            'bytes_per_sec': 0.1,
            'pkts_per_sec': 0.1,
            'pkt_byte_asymmetry': -0.1,
            'failed_conn_flag': -0.15,
            'http_error_flag': -0.1,
            'unusual_cipher_flag': -0.1,
            'ssl_cert_mismatch_flag': -0.1,
            'dns_query_entropy': -0.1,
            'node_degree': -0.1,
            'flow_rate': 0.05
        }

    @staticmethod
    def shannon_entropy(s: str) -> float:
        if not isinstance(s, str) or len(s) == 0:
            return 0.0
        prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
        return -sum(p * np.log2(p) for p in prob)

    def add_features(self, df: pd.DataFrame):
        try:
            logger.info("Starting feature engineering...")

            
            df['src_ip'] = df['src_ip'].astype(str).str.strip()

            df['bytes_per_sec'] = (df['src_bytes'] + df['dst_bytes']) / df['duration'].replace(0, np.nan)
            df['pkts_per_sec'] = (df['src_pkts'] + df['dst_pkts']) / df['duration'].replace(0, np.nan)

            df['avg_pkt_size_src'] = df['src_bytes'] / df['src_pkts'].replace(0, np.nan)
            df['avg_pkt_size_dst'] = df['dst_bytes'] / df['dst_pkts'].replace(0, np.nan)

            eps = 1e-6
            df['pkt_byte_asymmetry'] = abs(df['src_bytes'] - df['dst_bytes']) / \
                                       (df['src_bytes'] + df['dst_bytes'] + eps)

           
            abnormal_states = ['REJ', 'RSTO', 'RSTOS0', 'RSTR', 'RSTRH', 'S0', 'S1', 'S2', 'S3', 'SF', 'SH', 'SHR']

            abnormal_conn_cols = [
                f"conn_state_{state}" for state in abnormal_states
                if f"conn_state_{state}" in df.columns
            ]

            if abnormal_conn_cols:
                df["failed_conn_flag"] = (df[abnormal_conn_cols].sum(axis=1) > 0).astype(int)
            else:
                df["failed_conn_flag"] = 0

          
            df['http_error_flag'] = df['http_status_code'].apply(
                lambda x: 1 if pd.notna(x) and int(x) >= 400 else 0
            )

            weak_ciphers = ['TLS_RSA_WITH_RC4_128_SHA', 'SSL_RSA_WITH_3DES_EDE_CBC_SHA']
            df['unusual_cipher_flag'] = df['ssl_cipher'].isin(weak_ciphers).astype(int)

            df['ssl_cert_mismatch_flag'] = np.where(
                (df['ssl_subject'].notna()) &
                (df['ssl_issuer'].notna()) &
                (df['ssl_subject'] != df['ssl_issuer']),
                1, 0
            )

            df['dns_query_entropy'] = df['dns_query'].apply(self.shannon_entropy)

            node_degree = df.groupby('src_ip')['dst_ip'].nunique().reset_index(name='node_degree')
            df = df.merge(node_degree, on='src_ip', how='left')

            flow_rate = df['src_ip'].value_counts().rename_axis('src_ip').reset_index(name='flow_rate')
            df = df.merge(flow_rate, on='src_ip', how='left')

            trust_features = df.groupby('src_ip').agg({
                'bytes_per_sec': 'mean',
                'pkts_per_sec': 'mean',
                'pkt_byte_asymmetry': 'mean',
                'failed_conn_flag': 'mean',
                'http_error_flag': 'mean',
                'unusual_cipher_flag': 'mean',
                'ssl_cert_mismatch_flag': 'mean',
                'dns_query_entropy': 'mean',
                'node_degree': 'mean',
                'flow_rate': 'mean'
            }).reset_index()

            # Normalize trust_features
            for col in trust_features.columns[1:]:
                trust_features[col] = (trust_features[col] - trust_features[col].min()) / \
                                      (trust_features[col].max() - trust_features[col].min() + 1e-6)

            trust_features['trust_score'] = trust_features.apply(
                lambda row: sum(row[col] * w for col, w in self.weights.items()),
                axis=1
            )

            trust_features['trust_score'] = (trust_features['trust_score'] - trust_features['trust_score'].min()) / \
                                            (trust_features['trust_score'].max() - trust_features['trust_score'].min() + 1e-6)

            # ===== Assign trust_score to ALL 20k+ ROWS =====
            score_map = trust_features.set_index('src_ip')['trust_score'].to_dict()
            df['trust_score'] = df['src_ip'].map(score_map)

            logger.info("Feature engineering completed successfully.")
            return df, trust_features

        except Exception as e:
            logger.error("Error during feature engineering.")
            raise CustomException(e, sys)




# if __name__ == "__main__":
#     try:
#         logger.info("Starting feature engineering process...")

#         input_file = "/media/shrav/New Volume1/Mega_Project/TrustCast/data/dataset_processed.csv"
#         df = pd.read_csv(input_file)
#         logger.info(f"Loaded dataset from {input_file} with shape {df.shape}")

#         fe = FeatureEngineer()
#         df_enhanced, trust_features = fe.add_features(df)

#         # Save files
#         df_enhanced.to_csv("/media/shrav/New Volume1/Mega_Project/TrustCast/data/feature_engineering.csv", index=False)
#         trust_features.to_csv("/media/shrav/New Volume1/Mega_Project/TrustCast/data/trust_features_summary.csv", index=False)

#         logger.info("Feature engineering completed and files saved.")
#         print(df_enhanced.head())

#     except Exception as e:
#         logger.error("Feature engineering failed.")
#         raise CustomException(e, sys)
