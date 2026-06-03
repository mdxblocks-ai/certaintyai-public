"""CertaintyAI MCP (Model Context Protocol) Server.

Additive integration exposing CertaintyAI assessment scoring and semantic memory
as MCP tools using FastMCP.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from mcp.server.fastmcp import FastMCP

logger = logging.getLogger("mcp_server")
mcp = FastMCP("CertaintyAI")


@mcp.tool()
def calculate_ai_readiness(
    industry: str,
    role: str,
    answers: dict[str, Any],
) -> dict[str, Any]:
    """Generate an AI compliance and maturity readiness assessment from an industry, role, and survey answers."""
    return _run_readiness(industry, role, answers)


@mcp.tool()
def query_domain_ontology(
    industry: str,
    concept: str,
) -> list[dict[str, Any]]:
    """Query the pgvector-backed semantic memory and knowledge base for relevant enterprise case patterns."""
    return _query_ontology(industry, concept)


def _run_readiness(industry: str, role: str, answers: dict[str, Any]) -> dict[str, Any]:
    """Integration hook to run the readiness report agent with full database binding."""
    try:
        from app.agents.orchestrator import generate_readiness_report
        from app.database import SessionLocal
    except ImportError as err:
        logger.error("Failed to import core readiness orchestrator: %s", err)
        return {"error": "Readiness orchestrator modules not available", "details": str(err)}

    full_answers = answers.copy() if answers else {}
    full_answers["role"] = role
    
    # Map selected industry into domains list
    if "domains" not in full_answers or not full_answers["domains"]:
        full_answers["domains"] = [industry] if industry else []
    elif industry and industry not in full_answers["domains"]:
        full_answers["domains"].append(industry)

    # Provide safe default values for required survey fields to prevent calculate_scores from failing
    if "company" not in full_answers or not full_answers["company"]:
        full_answers["company"] = {
            "company_name": "MCP Client",
            "contact_name": "MCP User",
            "email": "mcp@certaintyai.com",
            "additional_deliverables": ""
        }
    if "dataState" not in full_answers or not full_answers["dataState"]:
        full_answers["dataState"] = {
            "location": ["cloud"],
            "format": ["structured"],
            "freshness": ["monthly"],
            "quality": ["clean"],
            "volume": "medium"
        }
    if "semantic" not in full_answers:
        full_answers["semantic"] = "3-5_aligned"
    if "rag" not in full_answers:
        full_answers["rag"] = "pilot_unknown"
    if "audit" not in full_answers:
        full_answers["audit"] = "partial"
    if "oversight" not in full_answers:
        full_answers["oversight"] = "partial_adhoc"
    if "priority" not in full_answers:
        full_answers["priority"] = "risk_reduction"

    db = SessionLocal()
    try:
        # Generate the readiness report
        report_data = generate_readiness_report(full_answers, db=db)
        return json.loads(json.dumps(report_data, default=str))
    except Exception as exc:
        logger.exception("Error running readiness report in MCP Server")
        return {"error": "Failed to generate readiness assessment", "details": str(exc)}
    finally:
        db.close()


def _query_ontology(industry: str, concept: str) -> list[dict[str, Any]]:
    """Integration hook to query pgvector-backed semantic memory and knowledge base."""
    try:
        from app.agents.embedding_service import create_vector_embedding, get_similar_memories
        from app.database import SessionLocal
        from app.models import AssessmentMemory, Assessment
    except ImportError as err:
        logger.error("Failed to import core embedding and memory retrieval modules: %s", err)
        return [{"error": "Embedding and memory service modules not available", "details": str(err)}]

    db = SessionLocal()
    try:
        # Combine industry and concept to construct search text signature
        query_text = f"Industry: {industry}. Concept: {concept}."
        
        # Generate embedding vector for the search query
        query_vector = create_vector_embedding(query_text)
        is_zero_vector = all(x == 0.0 for x in query_vector)
        
        # Fetch similar memories
        memories = get_similar_memories(db, query_vector, threshold=0.60, limit=3)
        
        # If no memories were found due to zero-vector similarity fallback, do a text keyword search
        if not memories and is_zero_vector:
            logger.info("MCP query_ontology: zero-vector detected, falling back to text keyword search")
            rows = db.query(AssessmentMemory).all()
            scored_memories = []
            for row in rows:
                assessment = db.query(Assessment).filter(Assessment.id == row.assessment_id).first()
                if assessment:
                    sig_lower = row.signature_text.lower()
                    if industry.lower() in sig_lower or concept.lower() in sig_lower:
                        scored_memories.append({
                            "assessment_id": row.assessment_id,
                            "signature_text": row.signature_text,
                            "similarity": 1.0, # Exact match on text fallback
                            "scores": assessment.scores or {},
                            "answers": assessment.answers or {},
                        })
            scored_memories.sort(key=lambda x: x["similarity"], reverse=True)
            memories = scored_memories[:3]
            
        return json.loads(json.dumps(memories, default=str))
    except Exception as exc:
        logger.exception("Error querying semantic memories in MCP Server")
        return [{"error": "Failed to query semantic memories", "details": str(exc)}]
    finally:
        db.close()
