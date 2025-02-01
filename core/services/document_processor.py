"""
Enhanced document processing service that combines PDF processing, RAG capabilities,
and specialized document extractors.
"""
import logging
import importlib
import os
import json
import re
from typing import List, Tuple, Dict, Any, Optional, Type
from io import BytesIO
from datetime import datetime

import PyPDF2
from openai import AzureOpenAI
import numpy as np

# Import extractors from the repos directory
from repos.ai_underwriting.backend.services.extractors.base import BaseExtractor
from repos.ai_underwriting.backend.services.extractors.rent_roll import RentRollExtractor
from repos.ai_underwriting.backend.services.extractors.pl_statement import PLStatementExtractor
from repos.ai_underwriting.backend.services.extractors.operating_statement import OperatingStatementExtractor
from repos.ai_underwriting.backend.services.extractors.lease import LeaseExtractor

from config.settings import (
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT_NAME,
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
    MAX_CHUNK_SIZE,
    OVERLAP_SIZE
)

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Handles document processing with advanced text extraction and AI analysis."""
    
    def __init__(self):
        """Initialize the document processor with enhanced capabilities."""
        # Initialize Azure OpenAI
        self.client = AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2023-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )
        self.deployment_name = AZURE_OPENAI_DEPLOYMENT_NAME
        self.embedding_deployment_name = AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME
        
        # Initialize document stores
        self.document_store: Dict[str, Dict[str, Any]] = {}
        self.embeddings_store: Dict[str, List[float]] = {}
        self.knowledge_graph: Dict[str, Dict[str, Any]] = {}
        
        # Initialize document extractors
        self.extractors: List[BaseExtractor] = [
            RentRollExtractor(),
            PLStatementExtractor(),
            OperatingStatementExtractor(),
            LeaseExtractor()
        ]
        
        # Initialize market data cache
        self.market_data_cache: Dict[str, Dict[str, Any]] = {}
        
        # Initialize document structure templates
        self.templates = self._load_templates()
        
        logger.info("Document processor initialized with enhanced capabilities")

    def extract_text(self, pdf_file: BytesIO) -> str:
        """Extract text content from a PDF file."""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            logger.info(f"Successfully extracted text from PDF ({len(text)} characters)")
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def _get_market_validation(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted data against market data."""
        if not self.market_data_cache or not extracted_data:
            return None
            
        validation_results = {
            "metrics_comparison": {},
            "risk_factors": [],
            "market_alignment": "unknown"
        }
        
        try:
            # Get relevant market data
            market_data = next(iter(self.market_data_cache.values()))["data"]
            
            # Compare key metrics
            metrics_to_compare = [
                ("noi", "NOI"),
                ("cap_rate", "Cap Rate"),
                ("occupancy_rate", "Occupancy"),
                ("expense_ratio", "Expense Ratio")
            ]
            
            for data_key, display_name in metrics_to_compare:
                if data_key in extracted_data and data_key in market_data:
                    actual = extracted_data[data_key]
                    market = market_data[data_key]
                    
                    if isinstance(market, dict) and "min" in market and "max" in market:
                        validation_results["metrics_comparison"][display_name] = {
                            "actual": actual,
                            "market_range": [market["min"], market["max"]],
                            "deviation": self._calculate_deviation(actual, market["min"], market["max"])
                        }
            
            # Identify risk factors
            if validation_results["metrics_comparison"]:
                for metric, data in validation_results["metrics_comparison"].items():
                    if abs(data["deviation"]) > 0.15:  # 15% threshold
                        validation_results["risk_factors"].append(
                            f"{metric} deviates significantly from market ({data['deviation']:.1%})"
                        )
            
            # Determine overall market alignment
            if validation_results["risk_factors"]:
                if len(validation_results["risk_factors"]) > 2:
                    validation_results["market_alignment"] = "poor"
                else:
                    validation_results["market_alignment"] = "moderate"
            else:
                validation_results["market_alignment"] = "good"
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Error in market validation: {str(e)}")
            return None

    def _calculate_deviation(self, actual: float, min_val: float, max_val: float) -> float:
        """Calculate deviation from market range."""
        market_mid = (min_val + max_val) / 2
        return (actual - market_mid) / market_mid if market_mid != 0 else 0

    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load document structure templates."""
        return {
            "offering_memorandum": {
                "sections": [
                    "executive_summary",
                    "property_overview",
                    "location_analysis",
                    "financial_analysis",
                    "market_overview",
                    "investment_highlights"
                ],
                "required_fields": [
                    "property_details",
                    "financial_metrics",
                    "market_data"
                ]
            },
            "investment_memo": {
                "sections": [
                    "investment_summary",
                    "property_description",
                    "financial_analysis",
                    "risk_assessment",
                    "recommendation"
                ],
                "required_fields": [
                    "investment_metrics",
                    "risk_factors",
                    "market_analysis"
                ]
            }
        }

    def _update_market_data(self, context: Dict[str, Any]) -> None:
        """Update market data cache with new context."""
        key = f"{context.get('property_type')}_{context.get('location')}"
        if key not in self.market_data_cache:
            self.market_data_cache[key] = {
                "timestamp": datetime.now().isoformat(),
                "data": context
            }

    def _update_knowledge_graph(self, chunks: Dict[str, Dict[str, Any]], extracted_data: Dict[str, Any]) -> None:
        """Update knowledge graph with new document information."""
        # Create nodes for extracted entities
        for key, value in extracted_data.items():
            node_id = f"entity_{key}_{hash(str(value))}"
            self.knowledge_graph[node_id] = {
                "type": "entity",
                "key": key,
                "value": value,
                "relationships": []
            }
        
        # Create nodes for document chunks
        for chunk_id, chunk_data in chunks.items():
            self.knowledge_graph[chunk_id] = {
                "type": "chunk",
                "text": chunk_data["text"],
                "metadata": chunk_data["metadata"],
                "relationships": []
            }
        
        # Create relationships between related nodes
        self._create_relationships()

    def _create_relationships(self) -> None:
        """Create relationships between knowledge graph nodes."""
        nodes = list(self.knowledge_graph.items())
        for i, (node_id, node) in enumerate(nodes):
            for other_id, other_node in nodes[i+1:]:
                if self._are_nodes_related(node, other_node):
                    relationship = self._determine_relationship(node, other_node)
                    node["relationships"].append({
                        "target": other_id,
                        "type": relationship
                    })
                    other_node["relationships"].append({
                        "target": node_id,
                        "type": relationship
                    })

    def _are_nodes_related(self, node1: Dict[str, Any], node2: Dict[str, Any]) -> bool:
        """Determine if two nodes are related."""
        if node1["type"] == "entity" and node2["type"] == "chunk":
            return str(node1["value"]) in node2["text"]
        elif node1["type"] == "chunk" and node2["type"] == "chunk":
            return self._calculate_text_similarity(node1["text"], node2["text"]) > 0.5
        return False

    def _determine_relationship(self, node1: Dict[str, Any], node2: Dict[str, Any]) -> str:
        """Determine the type of relationship between nodes."""
        if node1["type"] == "entity" and node2["type"] == "chunk":
            return "mentioned_in"
        elif node1["type"] == "chunk" and node2["type"] == "chunk":
            return "related_to"
        return "associated_with"

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text chunks."""
        # Create embeddings for both texts
        embeddings = self.create_embeddings([text1, text2])
        # Calculate cosine similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        return similarity

    def _hybrid_search(self, question: str, question_embedding: List[float], k: int) -> List[str]:
        """Combine vector similarity and knowledge graph search."""
        # Get results from vector search
        vector_results = self._vector_search(question_embedding, k)
        
        # Get results from knowledge graph
        graph_results = self._knowledge_graph_search(question, k)
        
        # Combine and deduplicate results
        all_results = vector_results + graph_results
        unique_results = list(dict.fromkeys(all_results))
        
        # Return top k results
        return unique_results[:k]

    def _vector_search(self, embedding: List[float], k: int) -> List[str]:
        """Perform vector similarity search."""
        similarities = {}
        for doc_id, doc_embedding in self.embeddings_store.items():
            similarity = np.dot(embedding, doc_embedding) / (
                np.linalg.norm(embedding) * np.linalg.norm(doc_embedding)
            )
            similarities[doc_id] = similarity
        
        top_k = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:k]
        return [self.document_store[doc_id]["text"] for doc_id, _ in top_k]

    def _knowledge_graph_search(self, question: str, k: int) -> List[str]:
        """Search using knowledge graph relationships."""
        # Extract key entities from question
        entities = self._extract_entities(question)
        
        # Find relevant nodes
        relevant_nodes = []
        for entity in entities:
            for node_id, node in self.knowledge_graph.items():
                if node["type"] == "entity" and entity.lower() in str(node["value"]).lower():
                    relevant_nodes.append(node_id)
                    # Add related nodes
                    for rel in node["relationships"]:
                        relevant_nodes.append(rel["target"])
        
        # Get unique text chunks from relevant nodes
        chunks = []
        for node_id in relevant_nodes:
            node = self.knowledge_graph[node_id]
            if node["type"] == "chunk":
                chunks.append(node["text"])
        
        return chunks[:k]

    def _extract_entities(self, text: str) -> List[str]:
        """Extract key entities from text using Azure OpenAI."""
        prompt = f"""Extract key commercial real estate entities from the text:
        Text: {text}
        Entities should include property types, metrics, locations, and financial terms.
        Format as a JSON array of strings."""
        
        response = self.client.chat.completions.create(
            model=self.deployment_name,
            messages=[
                {"role": "system", "content": "You are a CRE entity extractor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return []

    def _prepare_context(self, relevant_docs: List[str], question: str) -> str:
        """Prepare context for question answering."""
        # Sort documents by relevance to question
        doc_scores = []
        question_embedding = self.create_embeddings([question])[0]
        
        for doc in relevant_docs:
            doc_embedding = self.create_embeddings([doc])[0]
            similarity = np.dot(question_embedding, doc_embedding) / (
                np.linalg.norm(question_embedding) * np.linalg.norm(doc_embedding)
            )
            doc_scores.append((doc, similarity))
        
        sorted_docs = [doc for doc, _ in sorted(doc_scores, key=lambda x: x[1], reverse=True)]
        
        # Combine documents with section headers
        context_parts = []
        for i, doc in enumerate(sorted_docs, 1):
            context_parts.append(f"Document {i}:\n{doc}\n")
        
        return "\n".join(context_parts)

    def _enhance_answer_with_market_data(self, answer: str, question: str) -> str:
        """Enhance answer with relevant market data."""
        if not self.market_data_cache:
            return answer
        
        # Get relevant market data
        market_data = next(iter(self.market_data_cache.values()))["data"]
        
        # Create enhancement prompt
        prompt = f"""Original answer: {answer}
        Market context: {json.dumps(market_data)}
        Question: {question}
        
        Enhance the answer with relevant market data while maintaining a natural flow.
        Include specific metrics and trends when applicable."""
        
        response = self.client.chat.completions.create(
            model=self.deployment_name,
            messages=[
                {"role": "system", "content": "You are a CRE market analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        return response.choices[0].message.content

    def _calculate_answer_confidence(self, answer: str, context: str) -> float:
        """Calculate confidence score for the generated answer."""
        # Create embeddings for answer and context
        embeddings = self.create_embeddings([answer, context])
        
        # Calculate semantic similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        # Adjust confidence based on answer length and specificity
        length_factor = min(len(answer.split()) / 50, 1.0)  # Prefer answers with sufficient detail
        specificity_factor = len(re.findall(r'\d+(?:\.\d+)?%?', answer)) / 10  # Reward numerical details
        
        confidence = (similarity * 0.6) + (length_factor * 0.2) + (specificity_factor * 0.2)
        return round(min(confidence, 1.0), 3)

    def _needs_structure(self, filename: str) -> bool:
        """Determine if document needs structure."""
        structured_types = ['om', 'memo', 'report', 'analysis']
        return any(t in filename.lower() for t in structured_types)

    def _get_template_type(self, filename: str) -> str:
        """Determine template type from filename."""
        if 'om' in filename.lower():
            return 'offering_memorandum'
        return 'investment_memo'

    def _create_document_structure(self, data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
        """Create document structure from template."""
        template = self.templates.get(template_type, {})
        structure = {
            "type": template_type,
            "sections": {},
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "template_version": "1.0"
            }
        }
        
        # Organize data into sections
        for section in template.get("sections", []):
            structure["sections"][section] = self._organize_section_data(
                section, data, template.get("required_fields", [])
            )
        
        return structure

    def _organize_section_data(self, section: str, data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
        """Organize data for a document section."""
        section_data = {
            "content": {},
            "status": "incomplete",
            "missing_fields": []
        }
        
        # Map data to section
        for field in required_fields:
            if field in data:
                section_data["content"][field] = data[field]
            else:
                section_data["missing_fields"].append(field)
        
        # Update status
        if not section_data["missing_fields"]:
            section_data["status"] = "complete"
        
        return section_data

    def _store_document_metadata(self, filename: str, analysis_result: Dict[str, Any]) -> None:
        """Store document metadata for future reference."""
        metadata = {
            "filename": filename,
            "processed_at": analysis_result["processed_at"],
            "extractor_used": analysis_result["extractor_used"],
            "confidence_scores": analysis_result["confidence_scores"],
            "has_market_validation": bool(analysis_result.get("market_validation")),
            "has_structure": bool(analysis_result.get("document_structure")),
            "knowledge_graph_nodes": analysis_result["knowledge_graph_nodes"]
        }
        
        # Store metadata (implementation depends on storage solution)
        logger.info(f"Stored metadata for {filename}: {json.dumps(metadata)}")

    def _analyze_with_ai(self, text: str, market_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze document content using Azure OpenAI."""
        system_prompt = """You are a commercial real estate analyst. Extract the following information:
        - Property type and class
        - Net Operating Income (NOI)
        - Occupancy rate
        - Property value
        - Key financial metrics
        - Risk factors
        
        If market context is provided, include market comparison and risk assessment.
        Format the response as a JSON object."""
        
        user_content = f"Text: {text[:4000]}"
        if market_context:
            user_content += f"\nMarket Context: {json.dumps(market_context)}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
        
        response = self.client.chat.completions.create(
            model=self.deployment_name,
            messages=messages,
            temperature=0.3,
            max_tokens=1000
        )
        
        return json.loads(response.choices[0].message.content)

    def create_chunks(self, text: str) -> List[Tuple[str, dict]]:
        """Split text into overlapping chunks with metadata."""
        try:
            chunks = []
            start = 0
            
            while start < len(text):
                end = start + MAX_CHUNK_SIZE
                
                if end < len(text):
                    last_period = text.rfind('.', start, end)
                    last_newline = text.rfind('\n', start, end)
                    break_point = max(last_period, last_newline)
                    
                    if break_point > start:
                        end = break_point + 1
                
                chunk_text = text[start:end].strip()
                if chunk_text:
                    metadata = {
                        "start_char": start,
                        "end_char": end,
                        "chunk_size": len(chunk_text)
                    }
                    chunks.append((chunk_text, metadata))
                
                start = end - OVERLAP_SIZE if end < len(text) else len(text)
            
            logger.info(f"Created {len(chunks)} chunks from text")
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating chunks: {str(e)}")
            raise

    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for the given texts using Azure OpenAI."""
        try:
            response = self.client.embeddings.create(
                input=texts,
                model=self.embedding_deployment_name
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise

    def get_appropriate_extractor(self, content: str, filename: str) -> Optional[BaseExtractor]:
        """Get the appropriate extractor for the document type."""
        for extractor in self.extractors:
            if extractor.can_handle(content, filename):
                logger.info(f"Using {extractor.__class__.__name__} for {filename}")
                return extractor
        return None

    def analyze_document(self, pdf_file: BytesIO, filename: str, market_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process and analyze a PDF document with enhanced capabilities."""
        try:
            # Extract text
            raw_text = self.extract_text(pdf_file)
            
            # Try to get specialized extractor
            extractor = self.get_appropriate_extractor(raw_text, filename)
            extracted_data = {}
            
            if extractor:
                # Fetch market data if needed
                if market_context:
                    self._update_market_data(market_context)
                    extractor.fetch_market_data(
                        market_context.get('property_type', ''),
                        market_context.get('location', '')
                    )
                
                # Use specialized extractor
                extracted_data = extractor.extract(raw_text)
                validation_passed = extractor.validate()
                confidence_scores = extractor.get_confidence_scores()
                risk_profile = extractor.assess_risk_profile()
                
                if not validation_passed:
                    logger.warning(f"Validation errors in {filename}: {extractor.validation_errors}")
            
            # Create chunks and knowledge graph
            chunks = self.create_chunks(raw_text)
            chunk_texts = [chunk[0] for chunk in chunks]
            
            # Create embeddings
            embeddings = self.create_embeddings(chunk_texts)
            
            # Generate timestamp-based IDs
            import time
            timestamp = int(time.time())
            
            # Store document chunks and embeddings
            doc_chunks = {}
            for i, (text, embedding) in enumerate(zip(chunk_texts, embeddings)):
                doc_id = f"{timestamp}_{i}"
                doc_chunks[doc_id] = {
                    "text": text,
                    "metadata": chunks[i][1],
                    "embedding": embedding
                }
            
            # Update knowledge graph
            self._update_knowledge_graph(doc_chunks, extracted_data)
            
            # If no specialized extractor, use AI analysis
            if not extractor:
                extracted_data = self._analyze_with_ai(raw_text, market_context)
            
            # Create document structure if needed
            document_structure = None
            if self._needs_structure(filename):
                document_structure = self._create_document_structure(
                    extracted_data, 
                    self._get_template_type(filename)
                )
            
            # Prepare comprehensive analysis result
            analysis_result = {
                "status": "success",
                "text": raw_text,
                "chunks": len(chunks),
                "extracted_data": extracted_data,
                "confidence_scores": confidence_scores if extractor else {},
                "validation_errors": extractor.validation_errors if extractor else [],
                "extractor_used": extractor.__class__.__name__ if extractor else None,
                "risk_profile": risk_profile.value if extractor else None,
                "market_validation": self._get_market_validation(extracted_data) if market_context else None,
                "document_structure": document_structure,
                "knowledge_graph_nodes": len(self.knowledge_graph),
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Store document metadata
            self._store_document_metadata(filename, analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }

    def query_document(self, question: str, k: int = 3, context_type: str = 'hybrid') -> Dict[str, Any]:
        """Enhanced document querying with hybrid search and knowledge graph."""
        try:
            # Create embedding for the question
            question_embedding = self.create_embeddings([question])[0]
            
            if context_type == 'hybrid':
                # Combine vector similarity and knowledge graph search
                relevant_docs = self._hybrid_search(question, question_embedding, k)
            elif context_type == 'knowledge_graph':
                # Use knowledge graph for context
                relevant_docs = self._knowledge_graph_search(question, k)
            else:
                # Use vector similarity search
                relevant_docs = self._vector_search(question_embedding, k)
            
            # Prepare context
            context = self._prepare_context(relevant_docs, question)
            
            # Generate answer using Azure OpenAI
            messages = [
                {
                    "role": "system", 
                    "content": """You are an expert commercial real estate analyst. 
                    Use the provided context to answer questions accurately and professionally. 
                    Include relevant financial metrics and market insights when applicable."""
                },
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ]
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0.3,
                max_tokens=500
            )
            
            answer = response.choices[0].message.content
            
            # Enhance answer with market data if available
            if self.market_data_cache:
                answer = self._enhance_answer_with_market_data(answer, question)
            
            return {
                "answer": answer,
                "context": context,
                "source_documents": relevant_docs,
                "confidence": self._calculate_answer_confidence(answer, context),
                "market_data_used": bool(self.market_data_cache)
            }
            
        except Exception as e:
            logger.error(f"Error querying document: {str(e)}")
            raise
