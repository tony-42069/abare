"""
Enhanced document processing service that combines PDF processing, RAG capabilities,
and specialized document extractors.
"""
import logging
import importlib
import os
import json
from typing import List, Tuple, Dict, Any, Optional, Type
from io import BytesIO

import PyPDF2
from openai import AzureOpenAI
from typing import Dict, List, Tuple, Any
import numpy as np

# Import extractors from the repos directory
import sys
sys.path.append("repos/ai-underwriting")
from backend.services.extractors.base import BaseExtractor
from backend.services.extractors.rent_roll import RentRollExtractor
from backend.services.extractors.pl_statement import PLStatementExtractor
from backend.services.extractors.operating_statement import OperatingStatementExtractor
from backend.services.extractors.lease import LeaseExtractor

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
        """Initialize the document processor with Azure OpenAI, ChromaDB, and document extractors."""
        self.client = AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2023-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )
        self.deployment_name = AZURE_OPENAI_DEPLOYMENT_NAME
        self.embedding_deployment_name = AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME
        
        # Initialize in-memory vector store
        self.document_store: Dict[str, Dict[str, Any]] = {}
        self.embeddings_store: Dict[str, List[float]] = {}
        
        # Initialize document extractors
        self.extractors: List[BaseExtractor] = [
            RentRollExtractor(),
            PLStatementExtractor(),
            OperatingStatementExtractor(),
            LeaseExtractor()
        ]
        
        logger.info("Document processor initialized with Azure OpenAI, ChromaDB, and extractors")

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

    def analyze_document(self, pdf_file: BytesIO, filename: str) -> Dict[str, Any]:
        """Process and analyze a PDF document using specialized extractors and RAG capabilities."""
        try:
            # Extract text
            raw_text = self.extract_text(pdf_file)
            
            # Try to get specialized extractor
            extractor = self.get_appropriate_extractor(raw_text, filename)
            extracted_data = {}
            
            if extractor:
                # Use specialized extractor
                extracted_data = extractor.extract(raw_text)
                validation_passed = extractor.validate()
                confidence_scores = extractor.get_confidence_scores()
                
                if not validation_passed:
                    logger.warning(f"Validation errors in {filename}: {extractor.validation_errors}")
            
            # Create chunks for RAG
            chunks = self.create_chunks(raw_text)
            chunk_texts = [chunk[0] for chunk in chunks]
            
            # Create embeddings and store in ChromaDB
            embeddings = self.create_embeddings(chunk_texts)
            
            # Generate timestamp-based IDs
            import time
            timestamp = int(time.time())
            ids = [f"{timestamp}_{i}" for i in range(len(chunks))]
            
            # Store in memory
            for i, (text, embedding) in enumerate(zip(chunk_texts, embeddings)):
                doc_id = f"{timestamp}_{i}"
                self.document_store[doc_id] = {
                    "text": text,
                    "metadata": chunks[i][1]
                }
                self.embeddings_store[doc_id] = embedding
            
            # If no specialized extractor or additional analysis needed
            if not extractor:
                # Extract key information using Azure OpenAI
                system_prompt = """
                You are a commercial real estate analyst. Extract the following information from the document:
                - Property type and class
                - Net Operating Income (NOI)
                - Occupancy rate
                - Property value
                - Key financial metrics
                - Risk factors
                
                Format the response as a JSON object.
                """
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": raw_text[:4000]}  # First 4000 chars for initial analysis
                ]
                
                response = self.client.chat.completions.create(
                    model=self.deployment_name,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=1000
                )
                
                analysis_result = response.choices[0].message.content
                extracted_data = json.loads(analysis_result)
            
            return {
                "status": "success",
                "text": raw_text,
                "chunks": len(chunks),
                "extracted_data": extracted_data,
                "confidence_scores": confidence_scores if extractor else {},
                "validation_errors": extractor.validation_errors if extractor else [],
                "extractor_used": extractor.__class__.__name__ if extractor else None,
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }

    def query_document(self, question: str, k: int = 3) -> Dict[str, Any]:
        """Query the document store for relevant information."""
        try:
            # Create embedding for the question
            question_embedding = self.create_embeddings([question])[0]
            
            # Calculate cosine similarity
            similarities = {}
            for doc_id, doc_embedding in self.embeddings_store.items():
                similarity = np.dot(question_embedding, doc_embedding) / (
                    np.linalg.norm(question_embedding) * np.linalg.norm(doc_embedding)
                )
                similarities[doc_id] = similarity
            
            # Get top k results
            top_k = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:k]
            relevant_docs = [self.document_store[doc_id]["text"] for doc_id, _ in top_k]
            
            # Prepare context from retrieved documents
            context = "\n".join(relevant_docs)
            
            # Generate answer using Azure OpenAI
            messages = [
                {"role": "system", "content": "You are a helpful assistant that answers questions about commercial real estate documents. Use the provided context to answer questions accurately and concisely."},
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ]
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0.3,
                max_tokens=500
            )
            
            answer = response.choices[0].message.content
            
            return {
                "answer": answer,
                "context": context,
                "source_documents": relevant_docs
            }
            
        except Exception as e:
            logger.error(f"Error querying document: {str(e)}")
            raise
