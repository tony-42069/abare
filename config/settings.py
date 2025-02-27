"""
Configuration settings for the ABARE platform.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure OpenAI Settings
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME")

# MongoDB Settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "abare")

# Redis Settings
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Document Processing Settings
MAX_CHUNK_SIZE = 1000  # Maximum size of text chunks for processing
OVERLAP_SIZE = 100     # Overlap between chunks
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# API Settings
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "ABARE Platform"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://localhost:8000",  # FastAPI development server
    "http://localhost:8501",  # Streamlit development server
]

# Security Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Create required directories
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Validate required settings
required_settings = []  # Remove Azure OpenAI validation

missing_settings = [setting for setting in required_settings if not globals().get(setting)]
if missing_settings:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_settings)}")
