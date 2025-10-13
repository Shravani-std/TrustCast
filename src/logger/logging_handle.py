
import logging
import os
from datetime import datetime

logs_dir = os.path.join(os.getcwd(), "logs")
os.makedirs(logs_dir, exist_ok=True)

LOG_FILE = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
LOG_FILE_PATH = os.path.join(logs_dir, LOG_FILE)

logger = logging.getLogger("MLProjectLogger")
logger.setLevel(logging.INFO)


if not logger.hasHandlers():
    file_handler = logging.FileHandler(LOG_FILE_PATH)
    file_handler.setLevel(logging.INFO)
    

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)

  
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)


    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)

# Test logging when this file is run directly
# if __name__ == "__main__":
#     logger.info("Logging has started")
#     print(f"Logs are being written to: {LOG_FILE_PATH}")
