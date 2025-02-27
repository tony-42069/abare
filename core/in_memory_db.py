"""
In-memory MongoDB setup for ABARE platform.
This module provides a simple in-memory MongoDB setup for testing and development.
"""
import asyncio
import logging
from datetime import datetime
import mongomock
from pymongo import MongoClient
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InMemoryMongoDB:
    """In-memory MongoDB for testing and development."""
    
    def __init__(self):
        """Initialize the in-memory MongoDB client."""
        self.client = mongomock.MongoClient()
        self.db = self.client["abare"]
        logger.info("In-memory MongoDB initialized")
    
    async def seed_database(self):
        """Seed the database with sample data."""
        await self.clear_collections()
        
        # Seed properties collection
        properties = self.db["properties"]
        property_ids = []
        
        for i in range(1, 3):
            property_id = ObjectId()
            property_ids.append(property_id)
            
            property_data = {
                "_id": property_id,
                "name": f"Sample Property {i}",
                "address": f"{100 + i} Main Street, City {i}, State",
                "property_type": "office" if i % 2 == 0 else "retail",
                "square_feet": 10000 * i,
                "year_built": 2000 + i,
                "purchase_price": 1000000 * i,
                "current_value": 1200000 * i,
                "status": "active",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "financial_metrics": {
                    "noi": 75000 * i,
                    "cap_rate": 0.075,
                    "occupancy_rate": 0.95,
                    "debt_coverage_ratio": 1.25
                },
                "metadata": {
                    "source": "manual_entry",
                    "last_updated_by": "system"
                }
            }
            
            result = await properties.insert_one(property_data)
            logger.info(f"Inserted property with ID: {result.inserted_id}")
        
        # Seed documents collection
        documents = self.db["documents"]
        
        for i, property_id in enumerate(property_ids):
            doc_types = ["rent_roll", "operating_statement", "lease"]
            
            for j, doc_type in enumerate(doc_types):
                document_data = {
                    "_id": ObjectId(),
                    "filename": f"{doc_type}_{i+1}.pdf",
                    "file_path": f"/uploads/{doc_type}_{i+1}.pdf",
                    "file_type": "application/pdf",
                    "file_size": 1048576 * (j+1),
                    "document_type": doc_type,
                    "status": "completed",
                    "property_id": property_id,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "processing_status": {
                        "ocr": "completed",
                        "analysis": "completed"
                    },
                    "metadata": {
                        "source": "user_upload",
                        "processor_version": "1.0.0",
                        "processing_time": 5.2,
                        "confidence_score": 0.95
                    }
                }
                
                result = await documents.insert_one(document_data)
                logger.info(f"Inserted document with ID: {result.inserted_id}")
        
        # Seed analysis collection
        analyses = self.db["analyses"]
        
        for property_id in property_ids:
            analysis_data = {
                "_id": ObjectId(),
                "property_id": property_id,
                "analysis_type": "valuation",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "completed",
                "results": {
                    "estimated_value": 1500000,
                    "confidence_score": 0.85,
                    "comparable_properties": [str(ObjectId()) for _ in range(3)],
                    "key_metrics": {
                        "cap_rate": 0.065,
                        "noi": 97500,
                        "growth_rate": 0.02
                    }
                },
                "metadata": {
                    "model_version": "1.2.0",
                    "processing_time": 8.7
                }
            }
            
            result = await analyses.insert_one(analysis_data)
            logger.info(f"Inserted analysis with ID: {result.inserted_id}")
            
        logger.info("Database seeding completed!")
    
    async def clear_collections(self):
        """Clear all collections in the database."""
        collections = await self.db.list_collection_names()
        for collection in collections:
            await self.db[collection].delete_many({})
            logger.info(f"Cleared collection: {collection}")
    
    def get_connection_string(self):
        """Get the connection string for the in-memory MongoDB."""
        return "mongodb://localhost:27017/abare"

async def create_in_memory_db():
    """Create and seed an in-memory MongoDB."""
    db = InMemoryMongoDB()
    await db.seed_database()
    return db

async def get_in_memory_db():
    """Get an in-memory MongoDB instance."""
    return await create_in_memory_db()

# For testing purposes
if __name__ == "__main__":
    async def main():
        db = await create_in_memory_db()
        
        # Test query
        properties = db.db["properties"]
        async for prop in properties.find({}):
            print(f"Property: {prop['name']}")
        
        # Keep the script running
        print("In-memory MongoDB is running. Press Ctrl+C to exit.")
        while True:
            await asyncio.sleep(1)
    
    asyncio.run(main()) 