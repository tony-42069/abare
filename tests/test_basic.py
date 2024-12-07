import sys
import os
# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from broker.redis_client import MessageBroker

async def test_redis_connection():
    broker = MessageBroker()
    try:
        broker.redis_client.ping()
        print("Redis connection successful!")
    except Exception as e:
        print(f"Redis connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis_connection())