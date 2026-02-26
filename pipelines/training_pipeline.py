from src.steps.data_loader import DataLoader
from src.steps.data_preprocessing import DataPreprocessing
from src.steps.data_split import DataSplitter
from src.steps.feature_Engineering import FeatureEngineering
from src.steps.model_trainer import ModelTrainer
from TrustCast.src.steps.trust import TrustEngine


class TrainPipeline:
    def run(self, filepath):

        # 1. Load Data
        loader = DataLoader(filepath)
        df = loader.load_data()

        # 2. Data Preprocessing
        preprocessor = DataPreprocessing()
        df = preprocessor.preprocess()

         # 3. Feature Engineering
        fe = FeatureEngineering()
        df = fe.transform(df)

        # 4. Trust Engine
        trust = TrustEngine()
        df = trust.compute_trust(df)

        # 5. Split
        splitter = DataSplitter()
        X_train, X_test, y_train, y_test = splitter.split(df, "label")

        # 6. Train
        trainer = ModelTrainer()
        model = trainer.train(X_train, y_train)

        trainer.save_model("artifacts/model.pkl")

        print("Training completed successfully!")
