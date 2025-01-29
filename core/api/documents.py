"""
API router for document-related endpoints.
"""
import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
import logging

from core.models.document import Document, DocumentAnalysis
from core.services.document_processor import DocumentProcessor
from config.settings import UPLOAD_DIR

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb

@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload and process a new document."""
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
            analysis_result = await processor.analyze_document(content)
            
            # Update document with analysis results
            update_data = {
                "status": "completed",
                "analysis": DocumentAnalysis(**analysis_result),
                "processing_status": {
                    "ocr": "completed",
                    "analysis": "completed"
                }
            }
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            update_data = {
                "status": "error",
                "error_message": str(e),
                "processing_status": {
                    "ocr": "error",
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
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List all documents with pagination."""
    try:
        cursor = db.documents.find().skip(skip).limit(limit)
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
    from bson import ObjectId
    
    try:
        # Get document to check file path
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file if it exists
        if os.path.exists(document["file_path"]):
            os.remove(document["file_path"])
        
        # Delete document record
        result = await db.documents.delete_one({"_id": ObjectId(document_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"status": "success", "message": "Document deleted"}
