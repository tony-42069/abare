"""
API router for document-related endpoints with enhanced processing capabilities.
"""
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query, BackgroundTasks, Response, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
import logging
from bson import ObjectId
import uuid
from datetime import datetime

from core.models.document import Document, DocumentAnalysis, ExtractorResult
from core.services.document_processor import DocumentProcessor
from config.settings import UPLOAD_DIR
from core.utils import serialize_object_id

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    """Get MongoDB database instance."""
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
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Generate a unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Create document record
        document = {
            "filename": file.filename,
            "file_path": file_path,
            "file_type": file.content_type,
            "file_size": os.path.getsize(file_path),
            "document_type": document_type,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "processing_status": {
                "upload": "completed",
                "processing": "pending"
            }
        }
        
        if property_id:
            document["property_id"] = property_id
        
        # Insert document record
        result = await db.documents.insert_one(document)
        document["_id"] = result.inserted_id
        
        # Process the document in the background
        processor = DocumentProcessor()
        
        # Read the file
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        # Process the document (mock implementation)
        analysis_result = processor.analyze_document(file_content, file.filename)
        
        # Update document with analysis results
        await db.documents.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "status": "completed",
                    "processing_status.processing": "completed",
                    "extracted_data": analysis_result.get("extraction", {}),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Get the updated document
        updated_doc = await db.documents.find_one({"_id": result.inserted_id})
        return serialize_object_id(updated_doc)
        
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
    """Get document details by ID."""
    try:
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return serialize_object_id(document)
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
    """List documents with filtering and pagination."""
    try:
        # Build filter query
        filter_query = {}
        if property_id:
            filter_query["property_id"] = property_id
        if document_type:
            filter_query["document_type"] = document_type
        if status:
            filter_query["status"] = status
        
        # Log the query for debugging
        logger.info(f"List documents query: {filter_query}, skip: {skip}, limit: {limit}")
        
        # Execute query
        cursor = db.documents.find(filter_query).skip(skip).limit(limit)
        documents = await cursor.to_list(length=limit)
        
        # Apply serialization to each document
        serialized_documents = [serialize_object_id(doc) for doc in documents]
        return serialized_documents
        
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
        # Find the document
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete the document from the database
        result = await db.documents.delete_one({"_id": ObjectId(document_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete the file if it exists
        if "file_path" in document and os.path.exists(document["file_path"]):
            try:
                os.remove(document["file_path"])
            except Exception as e:
                logger.warning(f"Could not delete file: {document['file_path']} - {str(e)}")
        
        return {"status": "success", "message": "Document deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting document: {str(e)}"
        )
