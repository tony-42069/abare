import redis
from typing import Callable
import json

class MessageBroker:
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0):
        self.redis_client = redis.Redis(host=host, port=port, db=db)
    
    async def publish(self, channel: str, message: dict):
        """Publish message to Redis channel"""
        self.redis_client.publish(channel, json.dumps(message))
    
    async def subscribe(self, channel: str, callback: Callable):
        """Subscribe to Redis channel"""
        pubsub = self.redis_client.pubsub()
        pubsub.subscribe(channel)
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                await callback(json.loads(message['data']))