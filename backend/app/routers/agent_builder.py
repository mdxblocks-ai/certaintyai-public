"""Agent Builder Router (authenticated endpoints for C-Suite users)."""
from datetime import datetime, timezone
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User, Agent, AgentDocument, AgentDocumentChunk, AgentRun
from ..schemas import AgentCreate, AgentUpdate, AgentOut, AgentDocumentOut, AgentRunOut, AgentRunRequest
from ..agents.embedding_service import create_vector_embedding
from ..agents.agent_runtime import run_agent_loop

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agent_builder"])

ALL_TOOLS = ["Web search", "Doc retrieval", "Score lookup", "Email", "Calendar", "Database query", "Notify Slack"]

ROLE_PROFILES = {
    "base": {
        "icon": "ti-robot",
        "name": "AI Readiness Copilot",
        "desc": "Base AI Readiness assistant.",
        "inst": "You are a governed AI readiness assistant. Help the user evaluate their organization's AI adoption across security, governance, and financial dimensions.",
        "tools": ["Web search", "Doc retrieval", "Score lookup"],
        "starter_prompts": [
            "Explain my AI Readiness Score",
            "Identify AI maturity gaps",
            "Build an AI adoption roadmap"
        ]
    },
    "ciso": {
        "icon": "ti-shield-check",
        "name": "Vendor Risk Triage",
        "desc": "Reviews vendor docs and flags missing controls vs NIST AI RMF.",
        "inst": "You are a CISO's security analyst. Review documents through a security and risk lens: flag missing or weak controls against NIST AI RMF, identify data-protection and threat-exposure gaps, and draft a concise risk summary for review.",
        "tools": ["Web search", "Doc retrieval", "Score lookup", "Notify Slack"],
        "hint": "Pre-filled for a CISO: security & risk lens, controls, threat exposure.",
        "starter_prompts": [
            "Which NIST AI RMF controls are missing from this vendor's documentation?",
            "What are our top data-protection and threat-exposure gaps right now?",
            "Draft a concise risk summary of our current AI security posture."
        ]
    },
    "cfo": {
        "icon": "ti-building-bank",
        "name": "AI ROI Analyzer",
        "desc": "Assesses cost, ROI, and budget impact of AI initiatives.",
        "inst": "You are a CFO's finance analyst. Review documents through a financial lens: estimate cost and ROI, flag budget and value-realization risks, and summarize the business case in board-ready terms.",
        "tools": ["Database query", "Doc retrieval", "Score lookup", "Calendar"],
        "hint": "Pre-filled for a CFO: cost, ROI, budget impact, value realization.",
        "starter_prompts": [
            "What's our current AI spend, and where is the biggest waste?",
            "What's our AI cost-saving opportunity and the payback period?",
            "Does this AI proposal meet our investment and governance bar?"
        ]
    }
}


def ingest_remote_document_stub(source_type: str, source_ref: str) -> str:
    """
    ========================================================================
    PRODUCTION TODO:
    This is a stub for SharePoint and Portal URL crawler ingestion.
    SharePoint integration must utilize Microsoft Graph API authentication
    and subscriptions, while Portal URL must utilize a headless crawler (e.g. Playwright)
    to ingest PDF/HTML content dynamically into the pgvector indexing pipeline.
    ========================================================================
    """
    return "linked/queued"


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks for vector indexing."""
    chunks = []
    start = 0
    if not text:
        return []
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        # Safeguard to prevent infinite loop if overlap >= chunk_size
        step = max(chunk_size - overlap, 1)
        start += step
    return chunks


@router.get("/tools", response_model=List[str])
def get_available_tools(current: User = Depends(get_current_user)):
    """Return available capabilities/tools for custom agents."""
    return ALL_TOOLS


@router.get("/role-templates")
def get_role_templates(current: User = Depends(get_current_user)):
    """Return templates preconfigured for CISO and CFO."""
    return ROLE_PROFILES


@router.get("", response_model=List[AgentOut])
def list_agents(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all custom agents owned by the current user."""
    # Ensure the base agent exists for this user
    base_agent = db.query(Agent).filter(Agent.owner_id == current.id, Agent.role == "base").first()
    if not base_agent:
        base_agent = Agent(
            name="AI Readiness Copilot",
            description="Base AI Readiness assistant.",
            instructions="You are a governed AI readiness assistant. Help the user evaluate their organization's AI adoption across security, governance, and financial dimensions.",
            icon="ti-robot",
            role="base",
            model="Gemini 2.5 · Vertex AI",
            temperature=0.3,
            max_steps=25,
            tools=["Web search", "Doc retrieval", "Score lookup"],
            voice_enabled=True,
            owner_id=current.id
        )
        db.add(base_agent)
        try:
            db.commit()
            db.refresh(base_agent)
            logger.info("Auto-created base AI Readiness Copilot for user %s", current.email)
        except Exception:
            db.rollback()
            logger.exception("Failed to auto-create base agent on list_agents")
            
    return db.query(Agent).filter(Agent.owner_id == current.id).all()


@router.post("", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
def create_agent(
    payload: AgentCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new custom agent."""
    agent = Agent(
        name=payload.name,
        description=payload.description,
        instructions=payload.instructions,
        icon=payload.icon,
        role=payload.role,
        model=payload.model,
        temperature=payload.temperature,
        max_steps=payload.max_steps,
        tools=payload.tools,
        voice_enabled=payload.voice_enabled,
        owner_id=current.id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/{id}", response_model=AgentOut)
def get_agent(
    id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch details of a single custom agent."""
    agent = db.query(Agent).filter(Agent.id == id, Agent.owner_id == current.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{id}", response_model=AgentOut)
def update_agent(
    id: int,
    payload: AgentUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Modify configuration of an existing custom agent."""
    agent = db.query(Agent).filter(Agent.id == id, Agent.owner_id == current.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.role == "base":
        raise HTTPException(status_code=400, detail="Cannot modify the base agent configuration")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(agent, k, v)
        
    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(
    id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a custom agent and all associated documents and run history."""
    agent = db.query(Agent).filter(Agent.id == id, Agent.owner_id == current.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.role == "base":
        raise HTTPException(status_code=400, detail="Cannot delete the base agent")
    db.delete(agent)
    db.commit()
    return None


@router.post("/{id}/documents", response_model=AgentDocumentOut)
async def add_agent_document(
    id: int,
    source_type: str = Form(...),
    source_ref: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a reference source document to the agent's knowledge base.
    
    If source_type is 'local', chunks the text contents and indexes them.
    If 'sharepoint' or 'portal', creates a linked/queued stub.
    """
    agent = db.query(Agent).filter(Agent.id == id, Agent.owner_id == current.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    if source_type not in ["local", "sharepoint", "portal"]:
        raise HTTPException(status_code=400, detail="Invalid source type")
        
    status_str = "indexed"
    if source_type in ["sharepoint", "portal"]:
        status_str = ingest_remote_document_stub(source_type, source_ref)
        
    doc = AgentDocument(
        agent_id=agent.id,
        source_type=source_type,
        source_ref=source_ref,
        status=status_str,
        indexed_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # If it is a local file upload, read and index chunks
    # TODO: Implement real PDF/docx parsing + pgvector chunking later in production.
    # Currently fall back to reading plain-text content only.
    if source_type == "local" and file:
        try:
            contents = await file.read()
            text_content = contents.decode("utf-8", errors="ignore")
            chunks = chunk_text(text_content)
            
            for chunk in chunks:
                # Generate embedding
                vec = create_vector_embedding(chunk)
                chunk_record = AgentDocumentChunk(
                    agent_document_id=doc.id,
                    text=chunk,
                    embedding_json=json.dumps(vec)
                )
                db.add(chunk_record)
            db.commit()
        except Exception as exc:
            logger.exception("Failed to chunk and index local file upload")
            db.delete(doc)
            db.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to index local document: {exc}"
            )
            
    return doc


@router.post("/{id}/run", response_model=AgentRunOut)
def run_agent(
    id: int,
    payload: AgentRunRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute the agent on the user's input query and log trace steps."""
    agent = db.query(Agent).filter(Agent.id == id, Agent.owner_id == current.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    try:
        run_log = run_agent_loop(
            db=db,
            agent=agent,
            user_input=payload.input,
            owner_id=current.id,
            history=payload.history,
            attached_doc_ref=payload.attached_doc_ref,
            attached_doc_content=payload.attached_doc_content
        )
        return run_log
    except Exception as exc:
        logger.exception("Error executing agent")
        raise HTTPException(
            status_code=500,
            detail=f"Error executing agent loop: {exc}"
        )
