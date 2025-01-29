"""
Enhanced financial analysis service that combines traditional calculations with AI insights.
"""
import logging
import re
import json
from typing import Dict, Any, Optional, List
from datetime import datetime

from openai import AzureOpenAI
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
        logger.info("Financial Analysis service initialized")

    def extract_numbers(self, text: str) -> list:
        """Extract all numbers from text."""
        return [float(x.replace(',', '')) for x in re.findall(r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)', text)]

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

    def calculate_metrics(self, noi: float, property_value: float, 
                        loan_amount: Optional[float] = None,
                        debt_service: Optional[float] = None) -> Dict[str, float]:
        """Calculate key financial metrics."""
        metrics = {
            "cap_rate": (noi / property_value * 100) if property_value else 0.0,
            "price_per_sf": 0.0,  # Will be updated if square footage is available
            "cash_on_cash": 0.0,  # Will be calculated if we have the necessary inputs
        }
        
        if loan_amount:
            metrics["ltv"] = (loan_amount / property_value * 100)
        
        if debt_service:
            metrics["dscr"] = noi / debt_service
        
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

    async def analyze_property(self, doc_text: str, doc_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive financial analysis combining traditional metrics and AI insights."""
        try:
            # Extract basic metrics
            noi = self.find_noi(doc_text)
            occupancy = self.find_occupancy(doc_text)
            
            # Try to get property value and loan details from the AI analysis
            try:
                analysis_data = json.loads(doc_analysis.get('analysis', '{}'))
                property_value = analysis_data.get('property_value')
                loan_amount = analysis_data.get('loan_amount')
                debt_service = analysis_data.get('debt_service')
            except (json.JSONDecodeError, AttributeError):
                property_value = None
                loan_amount = None
                debt_service = None
            
            # Calculate traditional metrics
            metrics = self.calculate_metrics(
                noi=noi if noi else 0,
                property_value=property_value if property_value else 0,
                loan_amount=loan_amount,
                debt_service=debt_service
            )
            
            # Get AI insights
            insights = await self.get_ai_insights(doc_text[:8000])  # Use first 8000 chars for insights
            
            return {
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "basic_metrics": {
                    "noi": noi,
                    "occupancy_rate": occupancy,
                    "property_value": property_value
                },
                "financial_metrics": metrics,
                "ai_insights": insights,
                "confidence_score": 0.85  # Example confidence score
            }
            
        except Exception as e:
            logger.error(f"Error in property analysis: {str(e)}")
            return {
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
