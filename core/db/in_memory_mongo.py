"""
In-memory MongoDB implementation for testing and development.
"""
import asyncio
from bson import ObjectId
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InMemoryCollection:
    """In-memory implementation of a MongoDB collection."""
    
    def __init__(self, name: str):
        """Initialize an in-memory collection."""
        self.name = name
        self.data = {}
        logger.info(f"Created in-memory collection: {name}")
    
    async def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a document into the collection."""
        # If no _id, create one
        if '_id' not in document:
            document['_id'] = ObjectId()
        
        self.data[str(document['_id'])] = document
        return {"inserted_id": document['_id']}
    
    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document matching the query."""
        # Handle _id queries
        if '_id' in query and isinstance(query['_id'], ObjectId):
            doc_id = str(query['_id'])
            if doc_id in self.data:
                return self.data[doc_id]
            return None
        
        # Simple implementation for other queries
        for doc in self.data.values():
            matches = True
            for key, value in query.items():
                if key not in doc or doc[key] != value:
                    matches = False
                    break
            if matches:
                return doc
        
        return None
    
    async def find(self, query: Dict[str, Any] = None):
        """Find documents matching the query."""
        if query is None:
            query = {}
        
        class Cursor:
            def __init__(self, data, query):
                self.data = data
                self.query = query
                self.skip_count = 0
                self.limit_count = None
                
                # Filter data based on query
                self.filtered_data = []
                for doc in data.values():
                    matches = True
                    for key, value in query.items():
                        if key not in doc or doc[key] != value:
                            matches = False
                            break
                    if matches:
                        self.filtered_data.append(doc)
            
            async def to_list(self, length: int = None):
                """Return data as a list."""
                data = self.filtered_data[self.skip_count:]
                if self.limit_count is not None:
                    data = data[:self.limit_count]
                if length is not None:
                    data = data[:length]
                return data
            
            def skip(self, n: int):
                """Skip n documents."""
                self.skip_count = n
                return self
            
            def limit(self, n: int):
                """Limit to n documents."""
                self.limit_count = n
                return self
        
        return Cursor(self.data, query)
    
    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        """Update a single document matching the query."""
        doc = await self.find_one(query)
        if not doc:
            return {"matched_count": 0, "modified_count": 0}
        
        doc_id = str(doc['_id'])
        
        # Handle $set operator
        if '$set' in update:
            for key, value in update['$set'].items():
                self.data[doc_id][key] = value
        
        # Handle direct updates
        for key, value in update.items():
            if not key.startswith('$'):
                self.data[doc_id][key] = value
        
        return {"matched_count": 1, "modified_count": 1}
    
    async def delete_one(self, query: Dict[str, Any]):
        """Delete a single document matching the query."""
        doc = await self.find_one(query)
        if not doc:
            return {"deleted_count": 0}
        
        doc_id = str(doc['_id'])
        del self.data[doc_id]
        
        return {"deleted_count": 1}
    
    async def delete_many(self, query: Dict[str, Any]):
        """Delete multiple documents matching the query."""
        # Find all matching documents
        to_delete = []
        for doc_id, doc in self.data.items():
            matches = True
            for key, value in query.items():
                if key not in doc or doc[key] != value:
                    matches = False
                    break
            if matches:
                to_delete.append(doc_id)
        
        # Delete matched documents
        for doc_id in to_delete:
            del self.data[doc_id]
        
        return {"deleted_count": len(to_delete)}
    
    async def command(self, cmd: Dict[str, Any]):
        """Execute a command on the collection."""
        # Just support ping for now
        if 'ping' in cmd:
            return {"ok": 1}
        return {"ok": 0, "errmsg": "Command not supported"}

class InMemoryDatabase:
    """In-memory implementation of a MongoDB database."""
    def __init__(self):
        """Initialize an in-memory database."""
        self._collections = {}
    
    def __getattr__(self, name):
        """Get or create a collection by name."""
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]
    
    async def command(self, cmd):
        """Execute a database command."""
        # Just support ping for now
        if cmd == "ping":
            return {"ok": 1}
        return {"ok": 0, "errmsg": "Command not supported"}

class InMemoryMongoClient:
    """In-memory implementation of a MongoDB client."""
    def __init__(self):
        """Initialize an in-memory MongoDB client."""
        self._databases = {}
    
    def __getitem__(self, name):
        """Get or create a database by name."""
        if name not in self._databases:
            self._databases[name] = InMemoryDatabase()
        return self._databases[name]
    
    def close(self):
        """Close the client connection."""
        pass

async def seed_database(db):
    """Seed the database with sample data."""
    logger.info("Seeding in-memory database with sample data...")
    
    # Clear existing data
    await db.properties.delete_many({})
    await db.documents.delete_many({})
    await db.analysis.delete_many({})
    
    # Sample property data
    property_data = [
        {
            "name": "Tech Center Office Building",
            "property_type": "office",
            "property_class": "A",
            "year_built": 2015,
            "total_sf": 50000,
            "address": {
                "street": "123 Innovation Drive",
                "city": "Austin",
                "state": "TX",
                "zip_code": "78701",
                "country": "USA"
            },
            "financial_metrics": {
                "noi": 1500000,
                "cap_rate": 0.065,
                "occupancy_rate": 0.95,
                "property_value": 23000000,
                "price_per_sf": 460
            },
            "status": "completed",
            "metadata": {
                "source": "broker_submission",
                "last_updated": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            }
        },
        {
            "name": "Downtown Retail Plaza",
            "property_type": "retail",
            "property_class": "B",
            "year_built": 2005,
            "total_sf": 35000,
            "address": {
                "street": "456 Main Street",
                "city": "Phoenix",
                "state": "AZ",
                "zip_code": "85001",
                "country": "USA"
            },
            "financial_metrics": {
                "noi": 950000,
                "cap_rate": 0.07,
                "occupancy_rate": 0.92,
                "property_value": 13500000,
                "price_per_sf": 385
            },
            "status": "completed",
            "metadata": {
                "source": "broker_submission",
                "last_updated": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            }
        }
    ]
    
    property_ids = []
    for prop in property_data:
        result = await db.properties.insert_one(prop)
        property_ids.append(str(result.inserted_id))
        logger.info(f"Inserted property with ID: {result.inserted_id}")
    
    # Sample document data
    document_data = [
        {
            "filename": "tech_center_om.pdf",
            "property_id": property_ids[0],
            "document_type": "offering_memorandum",
            "upload_date": datetime.utcnow().isoformat(),
            "extraction_status": "completed",
            "extracted_data": {
                "property_name": "Tech Center Office Building",
                "noi": 1500000,
                "cap_rate": 0.065,
                "occupancy": 0.95
            },
            "metadata": {
                "uploaded_by": "user@example.com",
                "created_at": datetime.utcnow().isoformat()
            }
        },
        {
            "filename": "retail_plaza_lease.pdf",
            "property_id": property_ids[1],
            "document_type": "lease",
            "upload_date": datetime.utcnow().isoformat(),
            "extraction_status": "completed",
            "extracted_data": {
                "property_name": "Downtown Retail Plaza",
                "tenant": "Major Retailer Inc.",
                "term": "5 years",
                "annual_rent": 450000
            },
            "metadata": {
                "uploaded_by": "user@example.com",
                "created_at": datetime.utcnow().isoformat()
            }
        }
    ]
    
    document_ids = []
    for doc in document_data:
        result = await db.documents.insert_one(doc)
        document_ids.append(str(result.inserted_id))
        logger.info(f"Inserted document with ID: {result.inserted_id}")
    
    # Sample analysis data
    analysis_data = [
        {
            "property_id": property_ids[0],
            "analysis_type": "comprehensive",
            "status": "completed",
            "version": "1.0.0",
            "financial_analysis": {
                "metrics": {
                    "noi": 1500000,
                    "cap_rate": 0.065,
                    "occupancy_rate": 0.95,
                    "property_value": 23000000
                },
                "assumptions": {
                    "rent_growth": 0.03,
                    "expense_growth": 0.02
                }
            },
            "market_analysis": {
                "market_overview": "Strong office market with low vacancy rates",
                "market_metrics": {
                    "market_vacancy": 0.08,
                    "market_rent_per_sf": 45,
                    "market_cap_rate": 0.06
                }
            },
            "risk_assessment": {
                "risk_score": 75,
                "risk_factors": [
                    {"factor": "Tenant concentration", "impact": "medium"},
                    {"factor": "Market competition", "impact": "low"}
                ],
                "recommendations": ["Develop tenant retention strategy"]
            },
            "source_documents": [
                {
                    "document_id": document_ids[0],
                    "filename": "tech_center_om.pdf",
                    "relevance_score": 0.95
                }
            ],
            "processing_time": 45.2,
            "confidence_score": 0.92,
            "metadata": {
                "source": "automated_analysis",
                "processor_version": "1.0.0",
                "created_at": datetime.utcnow().isoformat()
            }
        }
    ]
    
    for analysis in analysis_data:
        result = await db.analysis.insert_one(analysis)
        logger.info(f"Inserted analysis with ID: {result.inserted_id}")
    
    logger.info("Database seeding completed!") 