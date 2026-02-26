import joblib #type:ignore
import pandas as pd #type: ignore
from src.steps.data_preprocessing import DataPreprocessing
from src.steps.feature_Engineering import FeatureEngineering
from TrustCast.src.steps.trust import TrustEngine

class PredictionPipeline:

    def __init__(self):
        self.model = joblib.load("artifacts/model.pkl")
        self.preprocessor = DataPreprocessing()
        self.fe = FeatureEngineering()
        self.trust = TrustEngine()

    def predict(self, input_dict):

        df = pd.DataFrame([input_dict])

        df = self.preprocessor.clean_data(df)
        df = self.fe.transform(df)
        df = self.trust.compute_trust(df)

        prediction = self.model.predict(df)

        return prediction[0]
