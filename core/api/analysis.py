"""
API router for analysis-related endpoints.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
from bson import ObjectId

from core.models.analysis import Analysis, AIInsight
from core.models.document import Document
from core.services.financial_analysis import FinancialAnalysis
from core.utils import serialize_object_id

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb

@router.post("/", response_model=Analysis)
async def create_analysis(
    analysis_data: Analysis,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new analysis."""
    try:
        # Insert analysis record
        result = await db.analysis.insert_one(analysis_data.dict(by_alias=True))
        
        # Retrieve the inserted document
        created_analysis = await db.analysis.find_one({"_id": result.inserted_id})
        return serialize_object_id(created_analysis)
        
    except Exception as e:
        logger.error(f"Error creating analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating analysis: {str(e)}"
        )

@router.get("/{analysis_id}", response_model=Analysis)
async def get_analysis(
    analysis_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get analysis by ID."""
    try:
        analysis = await db.analysis.find_one({"_id": ObjectId(analysis_id)})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return serialize_object_id(analysis)
        
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analysis: {str(e)}"
        )

@router.get("/property/{property_id}", response_model=List[Analysis])
async def list_property_analyses(
    property_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List analyses for a specific property."""
    try:
        cursor = db.analysis.find({"property_id": property_id})
        analyses = await cursor.to_list(length=100)
        return [serialize_object_id(analysis) for analysis in analyses]
        
    except Exception as e:
        logger.error(f"Error listing property analyses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error listing property analyses: {str(e)}"
        )

@router.post("/property/{property_id}/insights")
async def generate_insights(
    property_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate new AI insights for a property."""
    try:
        # Get property documents
        property_data = await db.properties.find_one({"_id": ObjectId(property_id)})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Get all related documents
        documents = []
        if "document_ids" in property_data:
            for doc_id in property_data["document_ids"]:
                doc = await db.documents.find_one({"_id": ObjectId(doc_id)})
                if doc:
                    documents.append(doc)
        
        # Create financial analysis service
        analyzer = FinancialAnalysis()
        
        # Generate insights
        insights = []
        for doc in documents:
            if doc.get("analysis", {}).get("raw_text"):
                insight = await analyzer.get_ai_insights(doc["analysis"]["raw_text"])
                insights.append(AIInsight(
                    category="document_analysis",
                    confidence=insight.get("confidence", 0.8),
                    summary=insight.get("summary", ""),
                    details=insight
                ))
        
        # Create new analysis record
        analysis = Analysis(
            property_id=property_id,
            analysis_type="ai_insights",
            key_findings=insights,
            processing_time=0.0,  # Will be updated
            confidence_score=sum(i.confidence for i in insights) / len(insights) if insights else 0.0
        )
        
        # Save analysis
        result = await db.analysis.insert_one(analysis.dict(by_alias=True))
        analysis.id = str(result.inserted_id)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating insights: {str(e)}"
        )

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete analysis by ID."""
    try:
        result = await db.analysis.delete_one({"_id": ObjectId(analysis_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {"status": "success", "message": "Analysis deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting analysis: {str(e)}"
        )
