# tests/test_cre_analyst.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from agents.cre_analyst import CREAnalystAgent
from broker.redis_client import MessageBroker

async def test_property_analysis():
    # Test data
    property_data = {
        "gross_income": 1000000,
        "operating_expenses": 400000,
        "property_value": 10000000,
        "annual_debt_service": 450000,
        "income_growth": 0.03,
        "expense_growth": 0.02,
        "vacancy_rate": 0.05
    }

    # Initialize broker and agent
    broker = MessageBroker()
    agent = CREAnalystAgent(broker.redis_client)

    # Test analysis
    result = await agent._analyze_property(property_data)
    print("Analysis Result:", result)

if __name__ == "__main__":
    asyncio.run(test_property_analysis())