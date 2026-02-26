import sys
import numpy as np #type:ignore
import pandas as pd #type: ignore
from src.exception.exception_handle import CustomException
from src.logger.logging_handle import logger


class TrustEngine:
    """
    Multi-Dimensional Trust Computation Engine
    Robust version with missing-feature handling.
    """

    def __init__(self):
        pass

  
    # Normalization
    @staticmethod
    def normalize(series: pd.Series) -> pd.Series:
        if series.nunique() <= 1:
            return pd.Series(0.5, index=series.index)
        return (series - series.min()) / (series.max() - series.min() + 1e-6)

    # Required Columns Exist
    def ensure_columns(self, df: pd.DataFrame) -> pd.DataFrame:

        required_columns = [
            "byte_ratio",
            "packet_ratio",
            "load_diff",
            "burstiness_index",
            "inter_arrival_diff",
            "handshake_ratio",
            "ct_state_ttl",
            "src_aggression",
            "target_pressure",
            "connection_rate",
            "port_focus",
            "ct_src_ ltm",
            "ttl_entropy",
            "state_entropy",
        ]

        for col in required_columns:
            if col not in df.columns:
                logger.warning(f"{col} missing → filling with 0.")
                df[col] = 0

        return df

    # Traffic Trust
    def traffic_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        byte_balance = 1 - self.normalize(abs(df["byte_ratio"] - 1))
        packet_balance = 1 - self.normalize(abs(df["packet_ratio"] - 1))
        load_stability = 1 - self.normalize(df["load_diff"])

        df["T_traffic"] = (
            0.4 * byte_balance +
            0.3 * packet_balance +
            0.3 * load_stability
        )

        return df

    # Temporal Trust
    def temporal_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        burst_score = 1 - self.normalize(df["burstiness_index"])
        inter_arrival_score = 1 - self.normalize(df["inter_arrival_diff"])
        handshake_score = 1 - self.normalize(df["handshake_ratio"])

        df["T_temporal"] = (
            0.4 * burst_score +
            0.3 * inter_arrival_score +
            0.3 * handshake_score
        )

        return df

    # Protocol Trust
    def protocol_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        df["T_protocol"] = 1 - self.normalize(df["ct_state_ttl"])
        return df

    # Interaction Trust
    def interaction_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        df["T_interaction"] = 1 - self.normalize(df["src_aggression"])**2
        return df

    # Context Trust
    def context_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        context_combined = (
            df["target_pressure"] +
            df["connection_rate"] +
            df["port_focus"]
        )

        df["T_context"] = 1 - self.normalize(context_combined)
        return df


    # Direct Trust
    def direct_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        df["T_direct"] = 1 - self.normalize(df["ct_src_ ltm"])
        return df

       # Indirect Trust (Robust)
    def indirect_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        entropy_combined = df["ttl_entropy"] + df["state_entropy"]
        df["T_indirect"] = self.normalize(entropy_combined)

        return df

  
    # Contextual Trust
 
    def contextual_trust(self, df: pd.DataFrame) -> pd.DataFrame:

        df["T_contextual"] = (
            0.4 * df["T_context"] +
            0.3 * df["T_protocol"] +
            0.3 * df["T_interaction"]
        )

        return df

  
    # Final Trust Score

    def final_trust_score(self, df: pd.DataFrame) -> pd.DataFrame:

        df["Trust_Score"] = (
            0.15 * df["T_traffic"] +
            0.15 * df["T_temporal"] +
            0.20 * df["T_protocol"] +
            0.20 * df["T_interaction"] +
            0.15 * df["T_context"] +
            0.10 * df["T_direct"] +
            0.05 * df["T_indirect"]
        )

        df["Trust_Score"] = df["Trust_Score"].clip(0, 1)
        return df

    # Full Pipeline
    def apply(self, df: pd.DataFrame) -> pd.DataFrame:
        try:
            logger.info("Starting Trust Engine (Robust Mode)...")

            df = self.ensure_columns(df)

            df = self.traffic_trust(df)
            df = self.temporal_trust(df)
            df = self.protocol_trust(df)
            df = self.interaction_trust(df)
            df = self.context_trust(df)
            df = self.direct_trust(df)
            df = self.indirect_trust(df)
            df = self.contextual_trust(df)
            df = self.final_trust_score(df)

            logger.info("Trust Engine completed successfully.")
            return df

        except Exception as e:
            logger.error("Trust Engine failed.")
            raise CustomException(e, sys)


# Standalone Execution

if __name__ == "__main__":
    try:
        logger.info("Running Trust Engine standalone (Robust)...")

        input_path = "D:\\AI\\TrustCast\\data\\UNSW_feature_process_new.csv"
        output_path = "D:\\AI\\TrustCast\\data\\UNSW_trust_scored.csv"

        df = pd.read_csv(input_path)

        trust_engine = TrustEngine()
        df = trust_engine.apply_all(df)

        print("\nTrust Score Summary:")
        print(df["Trust_Score"].describe())

        if "Label" in df.columns:
            print("\nAverage Trust by Label:")
            print(df.groupby("Label")["Trust_Score"].mean())

        df.to_csv(output_path, index=False)

        logger.info("Trust scoring completed successfully.")

    except Exception as e:
        raise CustomException(e, sys)
