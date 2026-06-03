"""Embedding and Semantic Memory Retrieval Service."""
import json
import logging
import math
from sqlalchemy.orm import Session
from ..config import settings
from ..models import AssessmentMemory, Assessment

logger = logging.getLogger(__name__)

def generate_profile_signature(answers: dict) -> str:
    """Turn survey selections into a highly descriptive paragraph signature."""
    company_info = answers.get("company", {}) or {}
    company_name = company_info.get("company_name", "An enterprise")
    role = answers.get("role", "unknown role")
    
    # Selected domains/industries
    domains = answers.get("domains", []) or []
    domains_str = ", ".join(domains) if domains else "general domain"
    
    # Process enablers & data state
    data_state = answers.get("dataState", {}) or {}
    quality = ", ".join(data_state.get("quality", [])) or "unknown quality"
    freshness = ", ".join(data_state.get("freshness", [])) or "standard freshness"
    
    # Blocks and pain points
    blockers = ", ".join(answers.get("blockers", [])) or "no scaling blockers"
    pain_points = ", ".join(answers.get("painPoints", [])) or "no explicit pain points"
    maturity = ", ".join(answers.get("maturity", [])) or "exploring maturity"
    
    return (
        f"{company_name} is evaluating AI initiatives led by a {role} in the {domains_str} sector. "
        f"They are in the {maturity} stage. "
        f"Data quality is evaluated as {quality} with update freshness at {freshness}. "
        f"Major blockers reported: {blockers}. "
        f"Key pain points: {pain_points}."
    )

def create_vector_embedding(text: str) -> list[float]:
    """Contact Google Gemini text-embedding-004 to create the dense vector representation."""
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY is empty; returning zero-vector fallback for safety")
        return [0.0] * 768
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        
        # Call the standard embedding model
        result = genai.embed_content(
            model=settings.gemini_embedding_model,
            content=text,
            task_type="retrieval_document"
        )
        embedding = result.get("embedding", [])
        if len(embedding) == 768:
            return embedding
        logger.warning("Gemini returned invalid embedding size: %s; falling back", len(embedding))
    except Exception as exc:
        logger.exception("Failed to query Gemini embedding API")
        
    return [0.0] * 768

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculate the cosine similarity between two vector float arrays without numpy."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return float(dot_product / (norm1 * norm2))

def get_similar_memories(db: Session, query_vector: list[float], threshold: float = 0.70, limit: int = 2) -> list[dict]:
    """Retrieve the top most semantically similar historical memories.
    
    Features database-independent execution, calculating cosine similarity
    efficiently in-memory, which guarantees compatibility across SQLite and PostgreSQL.
    """
    # 1. Fetch all assessment memories
    rows = db.query(AssessmentMemory).all()
    if not rows:
        return []
        
    scored_memories = []
    
    # 2. Iterate and score
    for row in rows:
        try:
            vector = json.loads(row.embedding_json)
            if len(vector) != len(query_vector):
                continue
            sim = cosine_similarity(query_vector, vector)
            if sim >= threshold:
                # Retrieve the full assessment data to get findings
                assessment = db.query(Assessment).filter(Assessment.id == row.assessment_id).first()
                if assessment:
                    scored_memories.append({
                        "assessment_id": row.assessment_id,
                        "signature_text": row.signature_text,
                        "similarity": sim,
                        "scores": assessment.scores or {},
                        "answers": assessment.answers or {},
                    })
        except Exception:
            logger.exception("Failed to compute similarity for row %s", row.id)
            
    # 3. Sort by similarity descending
    scored_memories.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_memories[:limit]
