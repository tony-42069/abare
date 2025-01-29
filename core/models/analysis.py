 - """
Analysis models for the ABARE platform.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import Field
from decimal import Decimal

from .base import MongoModel, Status, Metadata
from .property import FinancialMetrics, MarketMetrics, RiskAssessment

class AIInsight(MongoModel):
    """AI-generated insights and recommendations."""
    category: str
    confidence: float = Field(ge=0, le=1)
    summary: str
    details: Dict[str, Any] = Field(default_factory=dict)
    source_chunks: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketAnalysis(MongoModel):
    """Market analysis results."""
    market_overview: str
    trends: List[Dict[str, Any]] = Field(default_factory=list)
    comparable_properties: List[Dict[str, Any]] = Field(default_factory=list)
    market_metrics: MarketMetrics
    ai_insights: List[AIInsight] = Field(default_factory=list)

class FinancialAnalysis(MongoModel):
    """Financial analysis results."""
    metrics: FinancialMetrics
    assumptions: Dict[str, Any] = Field(default_factory=dict)
    projections: Dict[str, List[Decimal]] = Field(default_factory=dict)
    sensitivity_analysis: Dict[str, Any] = Field(default_factory=dict)
    ai_insights: List[AIInsight] = Field(default_factory=list)

class DocumentReference(MongoModel):
    """Reference to source documents used in analysis."""
    document_id: str
    filename: str
    relevance_score: float = Field(ge=0, le=1)
    extracted_data: Dict[str, Any] = Field(default_factory=dict)
    page_references: List[int] = Field(default_factory=list)

class Analysis(MongoModel):
    """Comprehensive analysis results combining multiple analysis types."""
    # Basic Information
    property_id: str
    analysis_type: str
    status: str = Field(default=Status.PENDING)
    version: str = "1.0.0"
    
    # Analysis Components
    financial_analysis: Optional[FinancialAnalysis] = None
    market_analysis: Optional[MarketAnalysis] = None
    risk_assessment: Optional[RiskAssessment] = None
    
    # Document Sources
    source_documents: List[DocumentReference] = Field(default_factory=list)
    
    # AI Insights
    key_findings: List[AIInsight] = Field(default_factory=list)
    recommendations: List[AIInsight] = Field(default_factory=list)
    
    # Processing Information
    processing_time: float  # in seconds
    confidence_score: float = Field(ge=0, le=1)
    metadata: Metadata = Field(default_factory=Metadata)
    
    class Config:
        schema_extra = {
            "example": {
                "property_id": "123456",
                "analysis_type": "comprehensive",
                "status": Status.COMPLETED,
                "version": "1.0.0",
                "financial_analysis": {
                    "metrics": {
                        "noi": 1500000,
                        "cap_rate": 0.065,
                        "occupancy_rate": 0.95,
                        "property_value": 23000000
                    }
                },
                "processing_time": 45.2,
                "confidence_score": 0.92,
                "metadata": {
                    "source": "automated_analysis",
                    "processor_version": "1.0.0"
                }
            }
        }
