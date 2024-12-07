# agents/base_agent.py
from langchain.agents import Agent
from langchain.schema import Document
from typing import List, Optional
import redis
from config.settings import settings

class BaseAgent:
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.settings = settings
        self._initialize_tools()
    
    def _initialize_tools(self):
        """Initialize agent-specific tools"""
        raise NotImplementedError
    
    async def process_message(self, message: dict):
        """Process incoming messages from Redis"""
        raise NotImplementedError