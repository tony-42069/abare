"""
Main FastAPI application for the ABARE platform.
"""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from config.settings import (
    PROJECT_NAME,
    API_V1_PREFIX,
    CORS_ORIGINS,
    MONGODB_URL,
    MONGODB_DB_NAME
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    openapi_url=f"{API_V1_PREFIX}/openapi.json",
    docs_url=f"{API_V1_PREFIX}/docs",
    redoc_url=f"{API_V1_PREFIX}/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
        app.mongodb = app.mongodb_client[MONGODB_DB_NAME]
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    logger.info("Closed MongoDB connection")

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Check MongoDB connection
        await app.mongodb.command("ping")
        return {
            "status": "healthy",
            "services": {
                "api": "up",
                "database": "up"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )

# Import and include API routers
from core.api import documents, properties, analysis

app.include_router(
    documents.router,
    prefix=f"{API_V1_PREFIX}/documents",
    tags=["documents"]
)

app.include_router(
    properties.router,
    prefix=f"{API_V1_PREFIX}/properties",
    tags=["properties"]
)

app.include_router(
    analysis.router,
    prefix=f"{API_V1_PREFIX}/analysis",
    tags=["analysis"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
