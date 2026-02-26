from typing import List
import sys
import numpy as np #type:ignore
import pandas as pd #type:ignore
from scipy.stats import entropy #type:ignore
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class FeatureEngineering:
    """
    Advanced feature engineering for UNSW-NB15 dataset
    """

    def __init__(self):
        pass

    # -----------------------------------------------------
    # 1. Structural Flow Features
    # -----------------------------------------------------
    def structural_flow_features(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Creating structural flow features...")

            df["byte_ratio"] = df["sbytes"] / (df["dbytes"] + 1)
            df["packet_ratio"] = df["Spkts"] / (df["Dpkts"] + 1)
            df["packet_diff"] = df["Spkts"] - df["Dpkts"]

            df["avg_packet_size_src"] = df["sbytes"] / (df["Spkts"] + 1)
            df["avg_packet_size_dst"] = df["dbytes"] / (df["Dpkts"] + 1)

            logger.info("Structural flow features created successfully.")
            return df

        except Exception as e:
            raise CustomException(e, sys)

    # -----------------------------------------------------
    # 2. Temporal Behaviour Features
    # -----------------------------------------------------
    def temporal_behaviour_features(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Creating temporal behaviour features...")

            df["burstiness_index"] = df["Sjit"] / (df["Sintpkt"] + 1e-6)
            df["load_diff"] = np.abs(df["Sload"] - df["Dload"])
            df["inter_arrival_diff"] = np.abs(df["Sintpkt"] - df["Dintpkt"])
            df["handshake_ratio"] = df["synack"] / (df["tcprtt"] + 1e-6)

            logger.info("Temporal behaviour features created successfully.")
            return df

        except Exception as e:
            raise CustomException(e, sys)

    # -----------------------------------------------------
    # 3. Density-Based Features
    # -----------------------------------------------------
    def density_features(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Creating density-based features...")

            TIME_WINDOW = 100

            # ⚠ FIXED COLUMN NAME (removed space)
            df["connection_rate"] = df["ct_src_ ltm"] / TIME_WINDOW
            df["src_aggression"] = df["ct_src_ ltm"] / (df["dur"] + 1e-6)
            df["target_pressure"] = df["ct_dst_ltm"] * df["Sload"]
            df["port_focus"] = df["ct_src_dport_ltm"] / (df["ct_src_ ltm"] + 1)

            logger.info("Density features created successfully.")
            return df

        except Exception as e:
            raise CustomException(e, sys)

    # -----------------------------------------------------
    # 4. Entropy-Based Features (TTL + State)
    # -----------------------------------------------------
    # def entropy_based_features(self, df: pd.DataFrame) -> pd.DataFrame:
    #     try:
    #         logger.info("Creating entropy-based features...")

    #         # ---------------- TTL ENTROPY ----------------
    #         if "sttl" in df.columns and "srcip" in df.columns:

    #             ttl_distribution = (
    #                 df.groupby("srcip")["sttl"]
    #                 .value_counts(normalize=True)
    #                 .rename("prob")
    #                 .reset_index()
    #             )

    #             ttl_entropy_series = (
    #                 ttl_distribution.groupby("srcip")["prob"]
    #                 .apply(lambda x: entropy(x, base=2))
    #             )

    #             df["ttl_entropy"] = df["srcip"].map(ttl_entropy_series).fillna(0)

    #         else:
    #             logger.warning("sttl or srcip missing. ttl_entropy set to 0.")
    #             df["ttl_entropy"] = 0

    #         # ---------------- STATE ENTROPY ----------------
    #         if "state" in df.columns and "srcip" in df.columns:

    #             state_distribution = (
    #                 df.groupby("srcip")["state"]
    #                 .value_counts(normalize=True)
    #                 .rename("prob")
    #                 .reset_index()
    #             )

    #             state_entropy_series = (
    #                 state_distribution.groupby("srcip")["prob"]
    #                 .apply(lambda x: entropy(x, base=2))
    #             )

    #             df["state_entropy"] = df["srcip"].map(state_entropy_series).fillna(0)

    #         else:
    #             logger.warning("state or srcip missing. state_entropy set to 0.")
    #             df["state_entropy"] = 0
    #         df.drop(columns=["srcip"])

    #         logger.info("Entropy features created successfully.")
    #         return df

    #     except Exception as e:
    #         raise CustomException(e, sys)

    # -----------------------------------------------------
    # Full Pipeline
    # -----------------------------------------------------
    def apply_all(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting full feature engineering pipeline...")

            df = self.structural_flow_features(df)
            df = self.temporal_behaviour_features(df)
            df = self.density_features(df)
            
            # df = self.entropy_based_features(df)

            logger.info("Feature engineering completed successfully.")
            return df

        except Exception as e:
            raise CustomException(e, sys)


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
if __name__ == "__main__":
    try:
        logger.info("Starting Feature Engineering module...")

        file_path = "D:\\AI\\TrustCast\\data\\UNSW_processed_new.csv"
        df = pd.read_csv(file_path)

        logger.info(f"Dataset loaded successfully with shape {df.shape}")

        fe = FeatureEngineering()
        df_engineered = fe.apply_all(df)

        output_path = "D:\\AI\\TrustCast\\data\\UNSW_feature_process_new.csv"
        df_engineered.to_csv(output_path, index=False)

        logger.info(f"Feature engineered dataset saved at {output_path}")

        print("ttl_entropy in dataset:", "ttl_entropy" in df_engineered.columns)
        print("state_entropy in dataset:", "state_entropy" in df_engineered.columns)

    except Exception as e:
        raise CustomException(e, sys)
