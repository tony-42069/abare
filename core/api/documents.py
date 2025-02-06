"""
API router for document-related endpoints with enhanced processing capabilities.
"""
import os
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query, BackgroundTasks, Response, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Request
import logging
from bson import ObjectId
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from core.services.task_queue import TaskQueue

from core.models.document import Document, DocumentAnalysis, ExtractorResult
from core.services.document_processor import DocumentProcessor
from core.services.task_queue import TaskQueue
from config.settings import UPLOAD_DIR

router = APIRouter()
logger = logging.getLogger(__name__)

def get_database() -> Any:
    """Get MongoDB database instance."""
    return Depends(lambda req: req.app.mongodb)

def get_task_queue() -> Any:
    """Get task queue instance."""
    return Depends(lambda req: req.app.task_queue)

@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...),
    property_id: Optional[str] = Query(None, description="Associated property ID"),
    document_type: Optional[str] = Query(None, description="Document type (e.g., rent_roll, operating_statement)"),
    db: AsyncIOMotorDatabase = get_database(),
    task_queue: TaskQueue = get_task_queue()
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
        result = db.documents.insert_one(document.dict(by_alias=True))
        document.id = str(result.inserted_id)
        
        # Create task for document processing
        task_id = str(uuid.uuid4())
        processor = DocumentProcessor()
        
        async def process_document():
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
                    },
                    "metadata": {
                        "processor_version": "2.0.0",
                        "processing_time": analysis_result.get("processing_time", 0),
                        "extractor_used": analysis_result.get("extractor_used"),
                        "confidence_score": analysis_result.get("confidence_scores", {}).get("overall", 0.0)
                    }
                }
                
                # Update document record
                await db.documents.update_one(
                    {"_id": result.inserted_id},
                    {"$set": update_data}
                )
                
                return update_data
                
            except Exception as e:
                logger.error(f"Error processing document: {str(e)}")
                error_data = {
                    "status": "error",
                    "error_message": str(e),
                    "processing_status": {
                        "ocr": "error",
                        "extraction": "error",
                        "analysis": "error"
                    }
                }
                
                await db.documents.update_one(
                    {"_id": result.inserted_id},
                    {"$set": error_data}
                )
                
                raise
        
        # Add processing task to queue
        await task_queue.add_task(task_id, process_document())
        
        # Update document with task ID
        await db.documents.update_one(
            {"_id": result.inserted_id},
            {"$set": {"task_id": task_id}}
        )
        
        return document
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading document: {str(e)}"
        )

# Add new endpoint for task status
@router.get("/{document_id}/task", response_model=Dict[str, Any])
async def get_document_task_status(
    document_id: str,
    db: AsyncIOMotorDatabase = get_database(),
    task_queue: TaskQueue = get_task_queue()
):
    """Get the processing task status for a document."""
    try:
        # Get document
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if document has a task
        if "task_id" not in document:
            return {
                "status": document.get("status", "unknown"),
                "processing_status": document.get("processing_status", {}),
                "has_task": False
            }
        
        # Get task status
        task_status = await task_queue.get_task_status(document["task_id"])
        
        return {
            "status": document.get("status", "unknown"),
            "processing_status": document.get("processing_status", {}),
            "has_task": True,
            "task": {
                "id": document["task_id"],
                "status": task_status["status"],
                "created_at": task_status["created_at"],
                "updated_at": task_status["updated_at"],
                "error": task_status.get("error")
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting task status: {str(e)}"
        )

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    db: AsyncIOMotorDatabase = get_database(),
    task_queue: TaskQueue = get_task_queue()
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
    db: AsyncIOMotorDatabase = get_database()
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
        documents = await db.documents.find(query).skip(skip).limit(limit).to_list(length=limit)
        return documents
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error listing documents: {str(e)}"
        )


@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: str,
    db: AsyncIOMotorDatabase = get_database(),
    task_queue: TaskQueue = get_task_queue()
):
    """Reprocess a document that failed or needs updating."""
    try:
        # Get document
        document = await db.documents.find_one({"_id": ObjectId(document_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Cancel existing task if any
        if "task_id" in document:
            try:
                await task_queue.cancel_task(document["task_id"])
            except ValueError:
                pass  # Task might not exist anymore
        
        # Create new processing task
        task_id = str(uuid.uuid4())
        processor = DocumentProcessor()
        
        async def reprocess():
            try:
                # Read file content
                with open(document["file_path"], "rb") as f:
                    content = f.read()
                
                # Process document
                analysis_result = await processor.analyze_document(content, document["filename"])
                
                # Prepare update data
                update_data = {
                    "status": "completed",
                    "document_type": document.get("document_type") or analysis_result.get("document_type"),
                    "property_id": document.get("property_id"),
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
                    },
                    "metadata": {
                        "processor_version": "2.0.0",
                        "processing_time": analysis_result.get("processing_time", 0),
                        "extractor_used": analysis_result.get("extractor_used"),
                        "confidence_score": analysis_result.get("confidence_scores", {}).get("overall", 0.0),
                        "reprocessed_at": datetime.utcnow()
                    }
                }
                
                # Update document
                await db.documents.update_one(
                    {"_id": ObjectId(document_id)},
                    {"$set": update_data}
                )
                
                return update_data
                
            except Exception as e:
                logger.error(f"Error reprocessing document: {str(e)}")
                error_data = {
                    "status": "error",
                    "error_message": str(e),
                    "processing_status": {
                        "ocr": "error",
                        "extraction": "error",
                        "analysis": "error"
                    }
                }
                
                await db.documents.update_one(
                    {"_id": ObjectId(document_id)},
                    {"$set": error_data}
                )
                
                raise
        
        # Add reprocessing task to queue
        await task_queue.add_task(task_id, reprocess())
        
        # Update document with new task ID
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "task_id": task_id,
                    "status": "processing",
                    "processing_status": {
                        "ocr": "pending",
                        "extraction": "pending",
                        "analysis": "pending"
                    }
                }
            }
        )
        
        return Response(status_code=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        logger.error(f"Error initiating document reprocessing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error initiating document reprocessing: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = get_database(),
    task_queue: TaskQueue = get_task_queue()
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
        # Cancel any running task
        if "task_id" in document:
            await task_queue.cancel_task(document["task_id"])
        
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
