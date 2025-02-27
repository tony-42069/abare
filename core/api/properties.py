"""
API router for property-related endpoints.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
from bson import ObjectId

from core.models.property import Property, Address, FinancialMetrics
from core.services.financial_analysis import FinancialAnalysis
from core.utils import serialize_object_id

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb

@router.post("/", response_model=Property)
async def create_property(
    property_data: Property,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new property."""
    try:
        # Insert property record
        result = await db.properties.insert_one(property_data.dict(by_alias=True))
        property_data.id = str(result.inserted_id)
        
        return property_data
        
    except Exception as e:
        logger.error(f"Error creating property: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating property: {str(e)}"
        )

@router.get("/{property_id}", response_model=Property)
async def get_property(
    property_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get property by ID."""
    try:
        property_data = await db.properties.find_one({"_id": ObjectId(property_id)})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        return serialize_object_id(property_data)
        
    except Exception as e:
        logger.error(f"Error retrieving property: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving property: {str(e)}"
        )

@router.get("/", response_model=List[Property])
async def list_properties(
    skip: int = 0,
    limit: int = 10,
    property_type: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List properties with filtering and pagination."""
    try:
        # Debug logging
        logger.info(f"Listing properties with filters: property_type={property_type}, min_value={min_value}, max_value={max_value}")
        logger.info(f"MongoDB database: {db}")
        
        # Build query filter
        filter_query = {}
        if property_type:
            filter_query["property_type"] = property_type
        if min_value is not None:
            filter_query["financial_metrics.property_value"] = {"$gte": min_value}
        if max_value is not None:
            if "financial_metrics.property_value" in filter_query:
                filter_query["financial_metrics.property_value"]["$lte"] = max_value
            else:
                filter_query["financial_metrics.property_value"] = {"$lte": max_value}
        
        logger.info(f"Using filter query: {filter_query}")
        
        # Test database connection
        try:
            await db.command("ping")
            logger.info("MongoDB connection test successful")
        except Exception as db_error:
            logger.error(f"MongoDB connection test failed: {str(db_error)}")
            raise
        
        cursor = db.properties.find(filter_query).skip(skip).limit(limit)
        properties = await cursor.to_list(length=limit)
        
        logger.info(f"Found {len(properties)} properties")
        
        # Apply serialization to each property
        serialized_properties = [serialize_object_id(prop) for prop in properties]
        return serialized_properties
        
    except Exception as e:
        logger.error(f"Error listing properties: {str(e)}")
        # Print more detailed error information
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error listing properties: {str(e)}"
        )

@router.put("/{property_id}", response_model=Property)
async def update_property(
    property_id: str,
    property_data: Property,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update property by ID."""
    try:
        # Check if property exists
        existing = await db.properties.find_one({"_id": ObjectId(property_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Update property
        update_result = await db.properties.update_one(
            {"_id": ObjectId(property_id)},
            {"$set": property_data.dict(by_alias=True, exclude={"id"})}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Property update failed")
        
        # Get updated property
        updated = await db.properties.find_one({"_id": ObjectId(property_id)})
        return updated
        
    except Exception as e:
        logger.error(f"Error updating property: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating property: {str(e)}"
        )

@router.delete("/{property_id}")
async def delete_property(
    property_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete property by ID."""
    try:
        # Check if property exists
        existing = await db.properties.find_one({"_id": ObjectId(property_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Delete property
        result = await db.properties.delete_one({"_id": ObjectId(property_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="Property deletion failed")
        
        return {"status": "success", "message": "Property deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting property: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting property: {str(e)}"
        )

@router.post("/{property_id}/analyze")
async def analyze_property(
    property_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Trigger analysis for a property."""
    try:
        # Get property data
        property_data = await db.properties.find_one({"_id": ObjectId(property_id)})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Get associated documents
        documents = []
        if "document_ids" in property_data:
            for doc_id in property_data["document_ids"]:
                doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
                if doc and doc.get("analysis"):
                    documents.append(doc)
        
        # Create financial analysis service
        analyzer = FinancialAnalysis()
        
        # Combine document texts for analysis
        combined_text = "\n".join([
            doc.get("analysis", {}).get("raw_text", "")
            for doc in documents
        ])
        
        # Get analysis results
        analysis_result = await analyzer.analyze_property(
            combined_text,
            {"analysis": property_data.get("analysis", {})}
        )
        
        # Update property with analysis results
        update_result = await db.properties.update_one(
            {"_id": ObjectId(property_id)},
            {"$set": {
                "status": "analyzed",
                "analysis": analysis_result
            }}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Analysis update failed")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing property: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing property: {str(e)}"
        )
