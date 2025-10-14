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

    def add_features(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting feature engineering...")

            df['bytes_per_sec'] = (df['src_bytes'] + df['dst_bytes']) / df['duration'].replace(0, np.nan)
            df['pkts_per_sec'] = (df['src_pkts'] + df['dst_pkts']) / df['duration'].replace(0, np.nan)
            logger.info("Added 'bytes_per_sec' and 'pkts_per_sec' features.")

  
            df['avg_pkt_size_src'] = df['src_bytes'] / df['src_pkts'].replace(0, np.nan)
            df['avg_pkt_size_dst'] = df['dst_bytes'] / df['dst_pkts'].replace(0, np.nan)
            logger.info("Added 'avg_pkt_size_src' and 'avg_pkt_size_dst' features.")

   
            eps = 1e-6
            df['pkt_byte_asymmetry'] = abs(df['src_bytes'] - df['dst_bytes']) / \
                                       (df['src_bytes'] + df['dst_bytes'] + eps)
            logger.info("Added 'pkt_byte_asymmetry' feature.")

     
            abnormal_states = ['OTH', 'RSTO', 'RSTR', 'S0', 'S1']
            df['failed_conn_flag'] = df['conn_state'].isin(abnormal_states).astype(int)
            logger.info("Added 'failed_conn_flag' feature.")

          
            df['http_error_flag'] = df['http_status_code'].apply(
                lambda x: 1 if pd.notna(x) and int(x) >= 400 else 0
            )
            logger.info("Added 'http_error_flag' feature.")

       
            weak_ciphers = ['TLS_RSA_WITH_RC4_128_SHA', 'SSL_RSA_WITH_3DES_EDE_CBC_SHA']
            df['unusual_cipher_flag'] = df['ssl_cipher'].isin(weak_ciphers).astype(int)
            df['ssl_cert_mismatch_flag'] = np.where(
                (df['ssl_subject'].notna()) & (df['ssl_issuer'].notna()) &
                (df['ssl_subject'] != df['ssl_issuer']),
                1, 0
            )
            logger.info("Added SSL security features.")

           
            df['dns_query_entropy'] = df['dns_query'].apply(self.shannon_entropy)
            logger.info("Added 'dns_query_entropy' feature.")

           
            node_degree = df.groupby('src_ip')['dst_ip'].nunique().reset_index(name='node_degree')
            df = df.merge(node_degree, on='src_ip', how='left')
            logger.info("Added 'node_degree' feature.")

         
            flow_rate = df['src_ip'].value_counts().rename_axis('src_ip').reset_index(name='flow_rate')
            df = df.merge(flow_rate, on='src_ip', how='left')
            logger.info("Added 'flow_rate' feature.")

            
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
            logger.info("Aggregated trust features per source IP.")

          
            for col in trust_features.columns[1:]:
                trust_features[col] = (trust_features[col] - trust_features[col].min()) / \
                                      (trust_features[col].max() - trust_features[col].min() + 1e-6)
            logger.info("Normalized trust features.")

            
            trust_features['trust_score'] = trust_features.apply(
                lambda row: sum(row[col] * w for col, w in self.weights.items()), axis=1
            )
            trust_features['trust_score'] = (trust_features['trust_score'] - trust_features['trust_score'].min()) / \
                                            (trust_features['trust_score'].max() - trust_features['trust_score'].min() + 1e-6)
            logger.info("Computed weighted 'trust_score'.")

            return df, trust_features

        except Exception as e:
            logger.error("Error during feature engineering.")
            raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        logger.info("Starting feature engineering process...")

        input_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network.csv"
        df = pd.read_csv(input_file)
        logger.info(f"Loaded dataset from {input_file} with shape {df.shape}")

        fe = FeatureEngineer()
        df_enhanced, trust_features = fe.add_features(df)

     
        df_enhanced.to_csv("/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network_enhanced.csv", index=False)
        trust_features.to_csv("/media/shrav/New Volume/Mega_Project/TrustCast/data/trust_features.csv", index=False)
        logger.info("Feature engineering completed and files saved.")

        print(trust_features.head())

    except Exception as e:
        logger.error("Feature engineering failed.")
        raise CustomException(e, sys)
