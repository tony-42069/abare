"""
Enhanced financial analysis service that combines traditional calculations with AI insights
and specialized document analysis.
"""
import logging
import re
import json
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from decimal import Decimal

from openai import AzureOpenAI
from repos.ai_underwriting.backend.services.extractors.base import BaseExtractor
from config.settings import (
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT_NAME
)

logger = logging.getLogger(__name__)

class FinancialAnalysis:
    """Handles financial analysis with both traditional metrics and AI insights."""
    
    def __init__(self):
        """Initialize the financial analysis service with Azure OpenAI."""
        self.client = AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2023-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )
        self.deployment_name = AZURE_OPENAI_DEPLOYMENT_NAME
        self.analysis_cache: Dict[str, Dict[str, Any]] = {}
        logger.info("Financial Analysis service initialized")

    def extract_numbers(self, text: str) -> List[float]:
        """Extract all numbers from text with improved accuracy."""
        numbers = []
        for match in re.finditer(r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\b', text):
            try:
                num_str = match.group(1).replace(',', '')
                numbers.append(float(num_str))
            except (ValueError, AttributeError):
                continue
        return numbers

    def find_metric(self, text: str, patterns: List[str]) -> Optional[float]:
        """Extract a metric using multiple patterns."""
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1).replace(',', ''))
        return None

    def find_noi(self, text: str) -> Optional[float]:
        """Extract NOI from document text."""
        patterns = [
            r'NOI[:|\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'Net Operating Income[:|\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'Annual NOI[:|\s]+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)'
        ]
        return self.find_metric(text, patterns)

    def find_occupancy(self, text: str) -> Optional[float]:
        """Extract occupancy rate from document text."""
        patterns = [
            r'Occupancy[:|\s]+(\d+(?:\.\d{1,2})?)\s*%',
            r'Occupied[:|\s]+(\d+(?:\.\d{1,2})?)\s*%',
            r'Occupancy Rate[:|\s]+(\d+(?:\.\d{1,2})?)\s*%'
        ]
        return self.find_metric(text, patterns)

    def calculate_metrics(self, 
                        noi: float, 
                        property_value: float,
                        square_footage: Optional[float] = None,
                        loan_amount: Optional[float] = None,
                        debt_service: Optional[float] = None,
                        total_revenue: Optional[float] = None,
                        total_expenses: Optional[float] = None) -> Dict[str, float]:
        """Calculate comprehensive financial metrics."""
        metrics = {
            "cap_rate": round((noi / property_value * 100), 2) if property_value else 0.0,
            "price_per_sf": round((property_value / square_footage), 2) if square_footage else 0.0,
            "noi_per_sf": round((noi / square_footage), 2) if square_footage else 0.0,
        }
        
        if loan_amount:
            metrics["ltv"] = round((loan_amount / property_value * 100), 2)
            metrics["equity_required"] = round(property_value - loan_amount, 2)
        
        if debt_service:
            metrics["dscr"] = round(noi / debt_service, 2)
        
        if total_revenue and total_expenses:
            metrics["expense_ratio"] = round((total_expenses / total_revenue * 100), 2)
            metrics["operating_margin"] = round((noi / total_revenue * 100), 2)
        
        return metrics

    async def get_ai_insights(self, analysis_text: str) -> Dict[str, Any]:
        """Get AI-powered insights about the property and market conditions."""
        try:
            system_prompt = """
            You are a commercial real estate analyst. Based on the provided analysis:
            1. Identify key strengths and weaknesses
            2. Assess market position
            3. Evaluate risk factors
            4. Provide investment recommendations
            
            Format the response as a JSON object with these sections.
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": analysis_text}
            ]
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0.3,
                max_tokens=1000
            )
            
            insights = json.loads(response.choices[0].message.content)
            return insights
            
        except Exception as e:
            logger.error(f"Error getting AI insights: {str(e)}")
            return {
                "error": "Failed to generate AI insights",
                "details": str(e)
            }

    def combine_extracted_data(self, extracted_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Combine data from multiple document extractions."""
        combined = {
            "noi": None,
            "property_value": None,
            "square_footage": None,
            "occupancy_rate": None,
            "total_revenue": None,
            "total_expenses": None,
            "loan_amount": None,
            "debt_service": None,
            "property_type": None,
            "property_class": None
        }
        
        confidence_scores = {}
        
        for data in extracted_data:
            for key, value in data.items():
                if key in combined:
                    if combined[key] is None or (isinstance(value, (int, float)) and value > combined[key]):
                        combined[key] = value
                        confidence_scores[key] = data.get("confidence_scores", {}).get(key, 0.0)
        
        return {
            "data": combined,
            "confidence_scores": confidence_scores
        }

    async def analyze_property(self, 
                             documents: List[Dict[str, Any]], 
                             extracted_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comprehensive financial analysis using multiple document sources."""
        try:
            # Combine extracted data from all documents
            combined_data = self.combine_extracted_data(extracted_data)
            data = combined_data["data"]
            
            # Calculate comprehensive metrics
            metrics = self.calculate_metrics(
                noi=data["noi"] if data["noi"] else 0,
                property_value=data["property_value"] if data["property_value"] else 0,
                square_footage=data["square_footage"],
                loan_amount=data["loan_amount"],
                debt_service=data["debt_service"],
                total_revenue=data["total_revenue"],
                total_expenses=data["total_expenses"]
            )
            
            # Combine all document text for AI insights
            combined_text = "\n".join([doc.get("text", "") for doc in documents])
            insights = await self.get_ai_insights(combined_text[:12000])  # Use first 12000 chars for insights
            
            # Market analysis using external data (placeholder)
            market_analysis = {
                "market_cap_rate": 5.5,  # Example value
                "market_occupancy": 92.0,
                "market_rent_growth": 3.0
            }
            
            return {
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "property_info": {
                    "type": data["property_type"],
                    "class": data["property_class"],
                    "square_footage": data["square_footage"]
                },
                "financial_metrics": {
                    "basic": {
                        "noi": data["noi"],
                        "occupancy_rate": data["occupancy_rate"],
                        "property_value": data["property_value"]
                    },
                    "calculated": metrics
                },
                "market_analysis": market_analysis,
                "ai_insights": insights,
                "confidence_scores": combined_data["confidence_scores"],
                "data_completeness": sum(1 for v in data.values() if v is not None) / len(data)
            }
            
        except Exception as e:
            logger.error(f"Error in property analysis: {str(e)}")
            return {
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
