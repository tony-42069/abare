"""
Main FastAPI application for the ABARE platform.
"""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import (
    PROJECT_NAME,
    API_V1_PREFIX,
    CORS_ORIGINS,
    MONGODB_URL,
    MONGODB_DB_NAME
)
from core.db.in_memory_mongo import InMemoryMongoClient, seed_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB initialization
@app.on_event("startup")
async def startup_services():
    try:
        # Initialize in-memory MongoDB connection
        app.mongodb_client = InMemoryMongoClient()
        app.mongodb = app.mongodb_client["abare_db"]
        
        # Seed the database with sample data
        await seed_database(app.mongodb)
        
        logger.info("Connected to MongoDB and initialized database")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_services():
    # Close MongoDB connection if needed
    if hasattr(app, 'mongodb_client'):
        app.mongodb_client.close()
    
    logger.info("Shut down all services")

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

# Use paths that match frontend expectations
app.include_router(
    documents.router,
    prefix="/api/documents",
    tags=["documents"]
)

app.include_router(
    properties.router,
    prefix="/api/properties",
    tags=["properties"]
)

app.include_router(
    analysis.router,
    prefix="/api/analysis",
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
