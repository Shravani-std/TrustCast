from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_url = os.getenv("MONGODB_URL")
if not mongo_url:
    raise RuntimeError("MONGODB_URL not set in environment")

client = AsyncIOMotorClient(mongo_url)

db = client["TrustCastDB"]

users_collection = db["users"]
contacts_collection = db["contacts"]