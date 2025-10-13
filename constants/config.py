RAW_DATA_PATH = "/media/shrav/New Volume/Mega_Project/TrustCast/data/train_test_network.csv"          # path to raw CSV/Parquet
PROCESSED_DATA_PATH = "/media/shrav/New Volume/Mega_Project/TrustCast/data/processed_dataset.csv"
WINDOW_SIZE = 60       # in seconds
STRIDE = 30            # in seconds
TIME_COL = "timestamp"
AGG_FUNCS = ["mean", "std", "count"]
