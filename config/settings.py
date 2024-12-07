import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Settings
    API_VERSION = "v1"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Redis Settings
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    
    # Anthropic Settings
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    
    # Database Settings
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./abare.db")

settings = Settings()