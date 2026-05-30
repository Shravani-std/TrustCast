
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

MONGO_URL = "mongodb+srv://prajwaltade16_db_user:5TlGULh9sYKbhpRw@trustcast.6zcjdwp.mongodb.net/TrustCastDB?appName=TrustCast"

async def test():
    client = AsyncIOMotorClient(MONGO_URL)

    try:
        await client.admin.command("ping")
        print("✅ MongoDB Connected Successfully")
    except Exception as e:
        print("❌ Connection Error:", e)

asyncio.run(test())