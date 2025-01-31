"""
API router for document-related endpoints with enhanced processing capabilities.
"""
import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
import logging
from bson import ObjectId

from core.models.document import Document, DocumentAnalysis, ExtractorResult
from core.services.document_processor import DocumentProcessor
from config.settings import UPLOAD_DIR

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb

@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    property_id: Optional[str] = Query(None, description="Associated property ID"),
    document_type: Optional[str] = Query(None, description="Document type (e.g., rent_roll, operating_statement)"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload and process a new document with specialized extraction.
    
    Args:
        file: The document file to upload
        property_id: Optional ID of the associated property
        document_type: Optional type of document for specialized processing
    """
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create document processor
        processor = DocumentProcessor()
        
        # Create initial document record
        document = Document(
            filename=file.filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=len(content),
            status="processing"
        )
        
        # Insert document record
        result = await db.documents.insert_one(document.dict(by_alias=True))
        document.id = str(result.inserted_id)
        
        # Process document asynchronously
        # Note: In production, this should be handled by a background task queue
        try:
            # Process with enhanced document processor
            analysis_result = await processor.analyze_document(content, file.filename)
            
            # Prepare update data with enhanced analysis results
            update_data = {
                "status": "completed",
                "document_type": document_type or analysis_result.get("document_type"),
                "property_id": property_id,
                "analysis": DocumentAnalysis(
                    raw_text=analysis_result["text"],
                    chunks=analysis_result.get("chunks", []),
                    extracted_data=analysis_result.get("extracted_data", {}),
                    extractor_results=[
                        ExtractorResult(
                            extractor_name=analysis_result["extractor_used"],
                            extracted_data=analysis_result["extracted_data"],
                            confidence_scores=analysis_result["confidence_scores"],
                            validation_errors=analysis_result["validation_errors"]
                        )
                    ] if analysis_result.get("extractor_used") else [],
                    ai_insights=analysis_result.get("ai_insights", {}),
                    confidence_scores=analysis_result.get("confidence_scores", {}),
                    validation_errors=analysis_result.get("validation_errors", [])
                ),
                "processing_status": {
                    "ocr": "completed",
                    "extraction": "completed" if analysis_result.get("extractor_used") else "skipped",
                    "analysis": "completed"
                }
            }
            
            # Update metadata with processing details
            update_data["metadata"] = {
                "processor_version": "2.0.0",
                "processing_time": analysis_result.get("processing_time", 0),
                "extractor_used": analysis_result.get("extractor_used"),
                "confidence_score": analysis_result.get("confidence_scores", {}).get("overall", 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            update_data = {
                "status": "error",
                "error_message": str(e),
                "processing_status": {
                    "ocr": "error",
                    "extraction": "error",
                    "analysis": "error"
                }
            }
        
        # Update document record
        await db.documents.update_one(
            {"_id": result.inserted_id},
            {"$set": update_data}
        )
        
        return document
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get document by ID."""
    from bson import ObjectId
    
    try:
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
        
    except Exception as e:
        logger.error(f"Error retrieving document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving document: {str(e)}"
        )

@router.get("/", response_model=List[Document])
async def list_documents(
    skip: int = 0,
    limit: int = 10,
    property_id: Optional[str] = None,
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List documents with filtering and pagination.
    
    Args:
        skip: Number of documents to skip
        limit: Maximum number of documents to return
        property_id: Filter by associated property
        document_type: Filter by document type
        status: Filter by processing status
    """
    try:
        # Build query filter
        query = {}
        if property_id:
            query["property_id"] = property_id
        if document_type:
            query["document_type"] = document_type
        if status:
            query["status"] = status
            
        # Execute query with filters
        cursor = db.documents.find(query).skip(skip).limit(limit)
        documents = await cursor.to_list(length=limit)
        return documents
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error listing documents: {str(e)}"
        )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a document by ID."""
    try:
        # Get document to check file path
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file if it exists
        if os.path.exists(document["file_path"]):
            try:
                os.remove(document["file_path"])
            except OSError as e:
                logger.error(f"Error deleting file: {str(e)}")
                # Continue with document deletion even if file deletion fails
        
        # Delete document record
        result = await db.documents.delete_one({"_id": ObjectId(document_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"status": "success", "message": "Document deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting document: {str(e)}"
        )
