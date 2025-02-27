"""
Base models and utilities for MongoDB integration.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from core.utils import PydanticObjectId

class MongoModel(BaseModel):
    """Base model with MongoDB ID field."""
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {
            datetime: lambda dt: dt.isoformat()
        }
    }

class Status:
    """Status constants for various models."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"

class Metadata(BaseModel):
    """Base metadata model."""
    source: Optional[str] = None
    processor_version: Optional[str] = None
    processing_time: Optional[float] = None
    confidence_score: Optional[float] = None
    additional_info: Dict[str, Any] = Field(default_factory=dict)
