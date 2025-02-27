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

class ExtractorResult(MongoModel):
    """Represents the results from a specialized document extractor."""
    extractor_name: str
    extracted_data: Dict[str, Any] = Field(default_factory=dict)
    confidence_scores: Dict[str, float] = Field(default_factory=dict)
    validation_errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentAnalysis(MongoModel):
    """Represents the analysis results of a document."""
    raw_text: str
    chunks: List[DocumentChunk]
    extracted_data: Dict[str, Any] = Field(default_factory=dict)
    extractor_results: List[ExtractorResult] = Field(default_factory=list)
    ai_insights: Dict[str, Any] = Field(default_factory=dict)
    confidence_scores: Dict[str, float] = Field(default_factory=dict)
    validation_errors: List[str] = Field(default_factory=list)
    metadata: Metadata = Field(default_factory=Metadata)

class Document(MongoModel):
    """Represents a processed document in the system."""
    filename: str
    file_path: str
    file_type: str
    file_size: int
    document_type: Optional[str] = None  # e.g., "rent_roll", "operating_statement", etc.
    status: str = Field(default=Status.PENDING)
    processing_status: Dict[str, str] = Field(default_factory=dict)
    error_message: Optional[str] = None
    
    # Document content and analysis
    analysis: Optional[DocumentAnalysis] = None
    metadata: Metadata = Field(default_factory=Metadata)
    
    # Relationships
    property_id: Optional[str] = None  # Link to associated property
    related_documents: List[str] = Field(default_factory=list)  # IDs of related documents
    
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
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
    }
