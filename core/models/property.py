"""
Property models for the ABARE platform.
"""
from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import Field, validator
from decimal import Decimal

from .base import MongoModel, Status, Metadata

class Address(MongoModel):
    """Property address information."""
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FinancialMetrics(MongoModel):
    """Property financial metrics."""
    noi: Decimal
    cap_rate: Decimal
    occupancy_rate: Decimal
    property_value: Decimal
    price_per_sf: Optional[Decimal] = None
    ltv: Optional[Decimal] = None
    dscr: Optional[Decimal] = None
    debt_yield: Optional[Decimal] = None
    irr: Optional[Decimal] = None
    cash_on_cash: Optional[Decimal] = None
    
    @validator('*')
    def round_decimals(cls, v):
        """Round all decimal values to 4 places."""
        if isinstance(v, Decimal):
            return round(v, 4)
        return v

class MarketMetrics(MongoModel):
    """Property market metrics and indicators."""
    market_vacancy: Optional[Decimal] = None
    market_rent_per_sf: Optional[Decimal] = None
    market_cap_rate: Optional[Decimal] = None
    submarket: Optional[str] = None
    market_classification: Optional[str] = None
    comp_properties: List[str] = Field(default_factory=list)

class RiskAssessment(MongoModel):
    """Property risk assessment."""
    risk_score: float = Field(ge=0, le=100)
    risk_factors: List[Dict[str, Any]] = Field(default_factory=list)
    opportunities: List[Dict[str, Any]] = Field(default_factory=list)
    threats: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class Property(MongoModel):
    """Represents a commercial real estate property."""
    # Basic Information
    name: str
    property_type: str
    property_class: Optional[str] = None
    year_built: Optional[int] = None
    total_sf: float
    address: Address
    
    # Status and Classification
    status: str = Field(default=Status.PENDING)
    listing_status: Optional[str] = None
    property_status: str = "active"
    
    # Financial Information
    financial_metrics: FinancialMetrics
    market_metrics: MarketMetrics = Field(default_factory=MarketMetrics)
    risk_assessment: Optional[RiskAssessment] = None
    
    # Related Documents
    document_ids: List[str] = Field(default_factory=list)
    
    # Additional Information
    features: Dict[str, Any] = Field(default_factory=dict)
    amenities: List[str] = Field(default_factory=list)
    tenants: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Metadata = Field(default_factory=Metadata)
    
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "Tech Center Office Building",
                "property_type": "office",
                "property_class": "A",
                "year_built": 2015,
                "total_sf": 50000,
                "address": {
                    "street": "123 Innovation Drive",
                    "city": "Austin",
                    "state": "TX",
                    "zip_code": "78701"
                },
                "financial_metrics": {
                    "noi": 1500000,
                    "cap_rate": 0.065,
                    "occupancy_rate": 0.95,
                    "property_value": 23000000,
                    "price_per_sf": 460
                },
                "status": Status.COMPLETED,
                "metadata": {
                    "source": "broker_submission",
                    "last_updated": "2025-01-29T15:00:00Z"
                }
            }
        }
    }
