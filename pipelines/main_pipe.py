import os
import sys
import joblib #type:ignore
import pandas as pd #type:ignore

from src.TrustEngine.data_loading import DataLoader
from src.TrustEngine.data_preprocessing import DataPreprocessing
from src.TrustEngine.feature_eng import FeatureEngineering
from src.TrustEngine.data_splitting import DataSplitter
from src.TrustEngine.trust_engine import TrustEngine
from src.TrustEngine.model_building import ModelBuilder
from src.TrustEngine.model_training import ModelTrainer
from src.TrustEngine.model_evaluation import ModelEvaluator

from src.logger.logging_handle import logger
from src.exception.exception_handle import CustomException


class TrustCastPipeline:

    def __init__(self, raw_data_path: str):
        self.raw_data_path = raw_data_path

    def run(self):

        try:
            logger.info("=========== TRUSTCAST PIPELINE STARTED ===========")

            # --------------------------------------------------
            # 1️⃣ Data Loading
            # --------------------------------------------------
            loader = DataLoader(self.raw_data_path)
            df = loader.load()

            # --------------------------------------------------
            # 2️⃣ Preprocessing
            # --------------------------------------------------
            preprocessor = DataPreprocessing()
            df = preprocessor.preprocess(df)

            # --------------------------------------------------
            # 3️⃣ Feature Engineering
            # --------------------------------------------------
            fe = FeatureEngineering()
            df = fe.apply(df)

            # --------------------------------------------------
            # 4️⃣ Time-based Split
            # --------------------------------------------------
            splitter = DataSplitter()
            train_df, val_df, test_df = splitter.split(df)

            # --------------------------------------------------
            # 5️⃣ Trust Engine
            # --------------------------------------------------
            trust_engine = TrustEngine()
            train_df = trust_engine.apply(train_df)
            val_df = trust_engine.apply(val_df)
            test_df = trust_engine.apply(test_df)

            # --------------------------------------------------
            # 6️⃣ Model Building
            # --------------------------------------------------
            trainer = ModelTrainer()
            builder = ModelBuilder()

            # Temporary scaling to get feature dimension
            # feature_dim = train_df.drop("Label", axis=1).shape[1]
            # window_size = 20

            # model = builder.build(window_size, feature_dim)

            # --------------------------------------------------
            # 7️⃣ Model Training
            # --------------------------------------------------
            model, scaler = trainer.train(builder, train_df, val_df)
            # --------------------------------------------------
            # 8️⃣ Evaluation
            # --------------------------------------------------
            evaluator = ModelEvaluator()
            evaluator.evaluate(model, scaler, test_df)

            # --------------------------------------------------
            # 9️⃣ Save Model & Scaler
            # --------------------------------------------------
            save_dir = "D:\\AI\\TrustCast\\models"
            os.makedirs(save_dir, exist_ok=True)

            model.save(os.path.join(save_dir, "trustcast_bigru_attention.h5"))
            joblib.dump(scaler, os.path.join(save_dir, "scaler.pkl"))

            logger.info("Model and scaler saved successfully.")

            logger.info("=========== TRUSTCAST PIPELINE COMPLETED ===========")

        except Exception as e:
            logger.error("Pipeline failed.")
            raise CustomException(e, sys)


# ==========================================================
# RUN PIPELINE
# ==========================================================
if __name__ == "__main__":

    try:
        RAW_DATA_PATH = "D:\\AI\\TrustCast\\data\\UNSW_1.csv"

        pipeline = TrustCastPipeline(RAW_DATA_PATH)
        pipeline.run()
        print("Model and scaler saved successfully!")

    except Exception as e:
        raise CustomException(e, sys)