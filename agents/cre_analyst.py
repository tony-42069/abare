# agents/cre_analyst.py
from .base_agent import BaseAgent
from langchain.tools import Tool
from langchain.schema.runnable import RunnableSequence  # Updated import path
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from typing import Dict, Any
import anthropic
import json

class CREAnalystAgent(BaseAgent):
    def __init__(self, redis_client):
        super().__init__(redis_client)
        self.llm = ChatAnthropic(
            model="claude-3.5-sonnet-20241022",  # October 2024 version
            anthropic_api_key=self.settings.ANTHROPIC_API_KEY,
            temperature=0.1,
            max_tokens=4000
        )
    
    def _initialize_tools(self):
        """Initialize CRE analysis tools"""
        self.tools = [
            Tool(
                name="analyze_property",
                func=self._analyze_property,
                description="Analyze property financials and metrics"
            ),
            Tool(
                name="analyze_market",
                func=self._analyze_market,
                description="Analyze market conditions and trends"
            ),
            Tool(
                name="validate_underwriting",
                func=self._validate_underwriting,
                description="Validate property underwriting assumptions"
            )
        ]

    async def _analyze_property(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze property financials and metrics
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a skilled commercial real estate analyst. Analyze the given property data and provide detailed insights."),
            ("user", "Analyze this property data: {property_data}")
        ])
        
        try:
            # Using new LangChain syntax
            chain = RunnableSequence([prompt, self.llm])
            analysis = await chain.ainvoke({"property_data": json.dumps(data)})
            
            # Structure the results
            result = {
                "status": "success",
                "analysis": analysis.content,
                "metrics": {
                    "noi": self._calculate_noi(data),
                    "cap_rate": self._calculate_cap_rate(data),
                    "dscr": self._calculate_dscr(data),
                    "irr": self._calculate_irr(data)
                }
            }
            
            # Publish results to Redis for other agents
            await self.redis_client.publish(
                "property_analysis_complete",
                json.dumps(result)
            )
            
            return result
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _calculate_noi(self, data: Dict[str, Any]) -> float:
        """Calculate Net Operating Income"""
        gross_income = data.get('gross_income', 0)
        operating_expenses = data.get('operating_expenses', 0)
        return gross_income - operating_expenses

    def _calculate_cap_rate(self, data: Dict[str, Any]) -> float:
        """Calculate Capitalization Rate"""
        noi = self._calculate_noi(data)
        property_value = data.get('property_value', 0)
        return (noi / property_value * 100) if property_value else 0

    def _calculate_dscr(self, data: Dict[str, Any]) -> float:
        """Calculate Debt Service Coverage Ratio"""
        noi = self._calculate_noi(data)
        debt_service = data.get('annual_debt_service', 0)
        return noi / debt_service if debt_service else 0

    def _calculate_irr(self, data: Dict[str, Any]) -> float:
        """Calculate Internal Rate of Return"""
        # Implement IRR calculation
        # This is a placeholder - we'll implement the full IRR calc later
        return 0.0

    async def _analyze_market(self, location: str) -> Dict[str, Any]:
        """
        Analyze market conditions and trends
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a market research analyst specializing in commercial real estate. Analyze the given market and provide insights."),
            ("user", "Analyze the market conditions for: {location}")
        ])
        
        try:
            chain = RunnableSequence([prompt, self.llm])
            analysis = await chain.ainvoke({"location": location})
            return {
                "status": "success",
                "market_analysis": analysis.content
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _validate_underwriting(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate property underwriting assumptions
        """
        # Add validation rules
        validation_results = {
            "income_growth": self._validate_growth_assumptions(data.get('income_growth', 0)),
            "expense_growth": self._validate_growth_assumptions(data.get('expense_growth', 0)),
            "vacancy_rate": self._validate_vacancy_rate(data.get('vacancy_rate', 0)),
            "cap_rate": self._validate_cap_rate(self._calculate_cap_rate(data))
        }
        
        return {
            "status": "success",
            "validation_results": validation_results,
            "is_valid": all(validation_results.values())
        }

    def _validate_growth_assumptions(self, growth_rate: float) -> bool:
        """Validate growth assumptions"""
        return 0 <= growth_rate <= 0.05  # Max 5% growth

    def _validate_vacancy_rate(self, vacancy_rate: float) -> bool:
        """Validate vacancy rate assumptions"""
        return 0 <= vacancy_rate <= 0.15  # Max 15% vacancy

    def _validate_cap_rate(self, cap_rate: float) -> bool:
        """Validate cap rate assumptions"""
        return 0.04 <= cap_rate <= 0.12  # Between 4% and 12%

    async def process_message(self, message: dict):
        """Process incoming messages from Redis"""
        message_type = message.get('type')
        data = message.get('data')
        
        if message_type == 'analyze_property':
            return await self._analyze_property(data)
        elif message_type == 'analyze_market':
            return await self._analyze_market(data.get('location'))
        elif message_type == 'validate_underwriting':
            return await self._validate_underwriting(data)
        else:
            return {"status": "error", "message": "Unknown message type"}