from typing import List, Dict, Tuple
import sys
import numpy as np # type: ignore
import pandas as pd # type: ignore

from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class FeatureEngineer:

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

        # will hold the aggregated table computed from TRAIN
        self.trust_features_: pd.DataFrame = pd.DataFrame()
        # fallback values for unseen src_ip
        self.fallbacks_: Dict[str, float] = {}

    @staticmethod
    def shannon_entropy(s: str) -> float:
        if not isinstance(s, str) or len(s) == 0:
            return 0.0
        prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
        return -sum(p * np.log2(p) for p in prob)

    def transform_row_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Compute row-level features only (safe to run on train/val/test)."""
        try:
            logger.info("Transforming row-level features...")
            df = df.copy()

            # ensure required columns exist (if not, create with zeros/NaNs)
            for col in ['src_bytes', 'dst_bytes', 'duration', 'src_pkts', 'dst_pkts',
                        'http_status_code', 'ssl_cipher', 'ssl_subject', 'ssl_issuer',
                        'dns_query', 'src_ip', 'dst_ip', 'conn_state']:
                if col not in df.columns:
                    logger.warning(f"Column '{col}' missing; creating with NaNs/zeros")
                    df[col] = np.nan if col in ['http_status_code', 'ssl_subject', 'ssl_issuer', 'dns_query', 'conn_state'] else 0

            # canonicalize src_ip for safe merging later
            df['src_ip'] = df['src_ip'].astype(str).str.strip()

            # Throughput & packet rates (handle duration==0)
            df['duration'] = df['duration'].replace(0, np.nan)
            df['bytes_per_sec'] = (df['src_bytes'].fillna(0) + df['dst_bytes'].fillna(0)) / df['duration']
            df['pkts_per_sec'] = (df['src_pkts'].fillna(0) + df['dst_pkts'].fillna(0)) / df['duration']

            # Average packet sizes
            df['avg_pkt_size_src'] = df['src_bytes'].replace(0, np.nan) / df['src_pkts'].replace(0, np.nan)
            df['avg_pkt_size_dst'] = df['dst_bytes'].replace(0, np.nan) / df['dst_pkts'].replace(0, np.nan)

            # Packet-byte asymmetry
            eps = 1e-6
            df['pkt_byte_asymmetry'] = np.abs(df['src_bytes'].fillna(0) - df['dst_bytes'].fillna(0)) / \
                                      (df['src_bytes'].fillna(0) + df['dst_bytes'].fillna(0) + eps)

            # Connection failure flag: if conn_state present as string label or one-hot columns
            abnormal_states = ['REJ', 'RSTO', 'RSTOS0', 'RSTR', 'RSTRH', 'S0', 'S1', 'S2', 'S3', 'SF', 'SH', 'SHR']
            abnormal_conn_cols = [f"conn_state_{s}" for s in abnormal_states if f"conn_state_{s}" in df.columns]

            if abnormal_conn_cols:
                df['failed_conn_flag'] = (df[abnormal_conn_cols].sum(axis=1) > 0).astype(int)
                logger.info(f"Computed failed_conn_flag from one-hot conn_state columns: {abnormal_conn_cols}")
            else:
                # if df['conn_state'] exists as values like 'S0','SF', use isin
                if 'conn_state' in df.columns:
                    df['failed_conn_flag'] = df['conn_state'].isin(abnormal_states).fillna(False).astype(int)
                    logger.info("Computed failed_conn_flag from conn_state string column.")
                else:
                    df['failed_conn_flag'] = 0
                    logger.info("No conn_state info found; set failed_conn_flag=0.")

            def http_error(x):
                try:
                    return 1 if pd.notna(x) and int(x) >= 400 else 0
                except Exception:
                    return 0

            df['http_error_flag'] = df['http_status_code'].apply(http_error)

            
            weak_ciphers = ['TLS_RSA_WITH_RC4_128_SHA', 'SSL_RSA_WITH_3DES_EDE_CBC_SHA']
            df['unusual_cipher_flag'] = df['ssl_cipher'].isin(weak_ciphers).astype(int)

            df['ssl_cert_mismatch_flag'] = np.where(
                (df['ssl_subject'].notna()) & (df['ssl_issuer'].notna()) & (df['ssl_subject'] != df['ssl_issuer']),
                1, 0
            )

            # DNS query entropy
            df['dns_query'] = df['dns_query'].fillna('').astype(str)
            df['dns_query_entropy'] = df['dns_query'].apply(self.shannon_entropy)

            logger.info("Row-level features added: bytes_per_sec, pkts_per_sec, avg_pkt_size_*, pkt_byte_asymmetry, flags, dns_query_entropy")
            return df

        except Exception as e:
            logger.error("Error while computing row-level features.")
            raise CustomException(e, sys)

    def fit_group_features(self, train_df: pd.DataFrame) -> pd.DataFrame:
        """Compute aggregated node-level features (node_degree, flow_rate, trust_features) on TRAIN only."""
        try:
            logger.info("Fitting group-level (train-only) features...")

            train_df = self.transform_row_features(train_df)

            node_degree = train_df.groupby('src_ip')['dst_ip'].nunique().reset_index(name='node_degree')

            flow_rate = train_df['src_ip'].value_counts().rename_axis('src_ip').reset_index(name='flow_rate')

            agg_df = train_df.merge(node_degree, on='src_ip', how='left') \
                              .merge(flow_rate, on='src_ip', how='left')

            trust_features = agg_df.groupby('src_ip').agg({
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

            # Normalize each column (0-1)
            cols = [c for c in trust_features.columns if c != 'src_ip']
            for col in cols:
                minv, maxv = trust_features[col].min(), trust_features[col].max()
                denom = (maxv - minv) if (maxv - minv) != 0 else 1.0
                trust_features[col] = (trust_features[col] - minv) / denom

            # Compute weighted trust_score
            def compute_trust(row):
                return sum(row.get(col, 0.0) * self.weights.get(col, 0.0) for col in cols)

            trust_features['trust_score'] = trust_features.apply(compute_trust, axis=1)

            # Final normalization of trust_score to 0-1
            minv, maxv = trust_features['trust_score'].min(), trust_features['trust_score'].max()
            denom = (maxv - minv) if (maxv - minv) != 0 else 1.0
            trust_features['trust_score'] = (trust_features['trust_score'] - minv) / denom

         
            self.trust_features_ = trust_features.copy()

          
            self.fallbacks_ = {}
            for col in ['node_degree', 'flow_rate', 'trust_score']:
                if col in trust_features.columns:
                    self.fallbacks_[col] = float(trust_features[col].median())
                else:
                    self.fallbacks_[col] = 0.0

            logger.info(f"Computed group-level features for {len(trust_features)} src_ip entries.")
            return trust_features

        except Exception as e:
            logger.error("Error while fitting group-level features.")
            raise CustomException(e, sys)

    def transform_group_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Map train-computed node-level features (trust_features_) to any dataset (train/val/test)."""
        try:
            if self.trust_features_.empty:
                raise ValueError("Group-level features not fitted. Call fit_group_features(train_df) first.")

            logger.info("Mapping group-level features to dataset...")
            df = df.copy()
            df['src_ip'] = df['src_ip'].astype(str).str.strip()

            # node_degree and flow_rate may be present in trust_features_ (as means) or we can compute raw ones
            # We'll map trust_score (and node_degree, flow_rate if present) from trust_features_
            to_map = {}
            if 'trust_score' in self.trust_features_.columns:
                to_map['trust_score'] = self.trust_features_.set_index('src_ip')['trust_score'].to_dict()
            if 'node_degree' in self.trust_features_.columns:
                to_map['node_degree'] = self.trust_features_.set_index('src_ip')['node_degree'].to_dict()
            if 'flow_rate' in self.trust_features_.columns:
                to_map['flow_rate'] = self.trust_features_.set_index('src_ip')['flow_rate'].to_dict()

            for col, mapping in to_map.items():
                df[col] = df['src_ip'].map(mapping)
              
                df[col] = df[col].fillna(self.fallbacks_.get(col, 0.0))

            logger.info("Group-level features mapped to dataset (unseen src_ip filled with fallbacks).")
            return df

        except Exception as e:
            logger.error("Error while mapping group-level features.")
            raise CustomException(e, sys)

    
    def add_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Backward-compatible method — computes row features then group features from the provided df.
        NOTE: This computes aggregates from the whole df (may leak). Prefer fit/transform flow above."""
        try:
            logger.warning("add_features() computes aggregates from the provided dataframe (may cause leakage). Prefer fit_group_features/transform_group_features.")
            df_rows = self.transform_row_features(df)
            trust_features = self.fit_group_features(df_rows)
            df_final = self.transform_group_features(df_rows)
            return df_final, trust_features
        except Exception as e:
            logger.error("Error in add_features (combined).")
            raise CustomException(e, sys)


if __name__ == "__main__":
    
    try:
        logger.info("Running feature_engineering example script...")

        input_file = "/media/shrav/New Volume/Mega_Project/TrustCast/data/dataset_processed.csv"
        df = pd.read_csv(input_file)
        logger.info(f"Loaded dataset from {input_file} with shape {df.shape}")

        from sklearn.model_selection import train_test_split # type: ignore
        train_df, temp = train_test_split(df, test_size=0.3, random_state=42, stratify=None)
        val_df, test_df = train_test_split(temp, test_size=0.5, random_state=42)

        fe = FeatureEngineer()

        # row-level features: safe to apply on all sets
        train_df = fe.transform_row_features(train_df)
        val_df = fe.transform_row_features(val_df)
        test_df = fe.transform_row_features(test_df)

        # compute group-level features on TRAIN ONLY
        trust_features = fe.fit_group_features(train_df)

        # map train group features to all sets (unseen src_ip filled with medians)
        train_df = fe.transform_group_features(train_df)
        val_df = fe.transform_group_features(val_df)
        test_df = fe.transform_group_features(test_df)

        out_train = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_feature_engineered.csv"
        out_val = "/media/shrav/New Volume/Mega_Project/TrustCast/data/val_feature_engineered.csv"
        out_test = "/media/shrav/New Volume/Mega_Project/TrustCast/data/test_feature_engineered.csv"
        out_summary = "/media/shrav/New Volume/Mega_Project/TrustCast/data/trust_features_summary.csv"

        train_df.to_csv(out_train, index=False)
        val_df.to_csv(out_val, index=False)
        test_df.to_csv(out_test, index=False)
        fe.trust_features_.to_csv(out_summary, index=False)

        logger.info("Feature engineering pipeline completed and files saved.")
        print(train_df.head())

    except Exception as e:
        logger.error("Feature engineering script failed.")
        raise CustomException(e, sys)
