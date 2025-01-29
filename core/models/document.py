"""
Document models for the ABARE platform.
"""
from typing import Optional, List, Dict, Any
from pydantic import Field

from .base import MongoModel, Status, Metadata

class DocumentChunk(MongoModel):
    """Represents a chunk of processed document text."""
    text: str
    start_char: int
    end_char: int
    chunk_size: int
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentAnalysis(MongoModel):
    """Represents the analysis results of a document."""
    raw_text: str
    chunks: List[DocumentChunk]
    extracted_data: Dict[str, Any] = Field(default_factory=dict)
    ai_insights: Dict[str, Any] = Field(default_factory=dict)
    metadata: Metadata = Field(default_factory=Metadata)

class Document(MongoModel):
    """Represents a processed document in the system."""
    filename: str
    file_path: str
    file_type: str
    file_size: int
    status: str = Field(default=Status.PENDING)
    processing_status: Dict[str, str] = Field(default_factory=dict)
    error_message: Optional[str] = None
    
    # Document content and analysis
    analysis: Optional[DocumentAnalysis] = None
    metadata: Metadata = Field(default_factory=Metadata)
    
    class Config:
        schema_extra = {
            "example": {
                "filename": "property_report.pdf",
                "file_path": "/uploads/property_report.pdf",
                "file_type": "application/pdf",
                "file_size": 1048576,
                "status": Status.COMPLETED,
                "processing_status": {
                    "ocr": Status.COMPLETED,
                    "analysis": Status.COMPLETED
                },
                "metadata": {
                    "source": "user_upload",
                    "processor_version": "1.0.0",
                    "processing_time": 5.2,
                    "confidence_score": 0.95
                }
            }
        }
