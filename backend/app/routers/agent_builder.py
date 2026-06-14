"""Agent Builder Router (authenticated endpoints for C-Suite users)."""
from datetime import datetime, timezone
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
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


def _extract_text_from_upload(content: bytes, filename: str = "", content_type: str = "") -> str:
    """Extract UTF-8 plain text from an uploaded file's raw bytes.

    Supports .pdf (pypdf), .docx (python-docx), .pptx (python-pptx), and
    plain-text family (.txt, .md, .csv, .json) via UTF-8 decode. Dispatches
    on filename extension first, falls back to content_type sniffing.

    Returns extracted text. Raises HTTPException(415) on parse failure.
    """
    name = (filename or "").lower()
    ct = (content_type or "").lower()

    def _ext_matches(*exts):
        return any(name.endswith(e) for e in exts)

    # --- PDF ---
    if _ext_matches(".pdf") or "pdf" in ct:
        import io
        # Pass 1: pypdf
        pypdf_text = ""
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            pages = []
            for page in reader.pages:
                try:
                    txt = page.extract_text() or ""
                except Exception:
                    txt = ""
                if txt.strip():
                    pages.append(txt)
            pypdf_text = "\n\n".join(pages)
        except Exception as exc:
            logger.warning("pypdf extraction failed for %r: %s", filename, exc)
            pypdf_text = ""

        # Pass 2: pdfminer.six — chained when pypdf returned <50 chars.
        # pdfminer often succeeds on PDFs whose content streams use encodings
        # pypdf can't decode. Pure Python, no system binaries.
        if len(pypdf_text.strip()) < 50:
            try:
                from pdfminer.high_level import extract_text as _pdfminer_extract
                miner_text = _pdfminer_extract(io.BytesIO(content)) or ""
            except Exception as exc:
                logger.warning("pdfminer extraction failed for %r: %s", filename, exc)
                miner_text = ""

            # Prefer whichever pass produced more readable text. Both can be
            # empty for image-only / scanned PDFs — return the longer one
            # (which will still be empty), and the runtime's empty-extract
            # branch will tell the user honestly.
            if len(miner_text.strip()) > len(pypdf_text.strip()):
                logger.info(
                    "[upload.extract] pdf engine=pdfminer pypdf_chars=%d miner_chars=%d filename=%r",
                    len(pypdf_text.strip()), len(miner_text.strip()), filename,
                )
                return miner_text
            else:
                logger.info(
                    "[upload.extract] pdf engine=pypdf pypdf_chars=%d miner_chars=%d filename=%r",
                    len(pypdf_text.strip()), len(miner_text.strip()), filename,
                )
        return pypdf_text

    # --- DOCX ---
    if _ext_matches(".docx") or "wordprocessingml" in ct:
        try:
            import io
            from docx import Document
            doc = Document(io.BytesIO(content))
            parts = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text and cell.text.strip():
                            parts.append(cell.text)
            return "\n\n".join(parts)
        except Exception as exc:
            logger.warning("DOCX extraction failed for %r: %s", filename, exc)
            raise HTTPException(status_code=415, detail=f"Failed to parse DOCX: {exc}")

    # --- PPTX ---
    if _ext_matches(".pptx") or "presentationml" in ct:
        try:
            import io
            from pptx import Presentation
            prs = Presentation(io.BytesIO(content))
            parts = []
            for slide in prs.slides:
                for shape in slide.shapes:
                    txt = getattr(shape, "text", "")
                    if txt and txt.strip():
                        parts.append(txt)
            return "\n\n".join(parts)
        except Exception as exc:
            logger.warning("PPTX extraction failed for %r: %s", filename, exc)
            raise HTTPException(status_code=415, detail=f"Failed to parse PPTX: {exc}")

    # --- Plain-text family + fallback ---
    return content.decode("utf-8", errors="ignore")


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
    # PDF / DOCX / PPTX are now extracted via _extract_text_from_upload;
    # plain-text family (.txt, .md, .csv, .json) falls through to utf-8 decode.
    if source_type == "local" and file:
        try:
            contents = await file.read()
            text_content = _extract_text_from_upload(
                contents,
                filename=file.filename or source_ref,
                content_type=file.content_type or "",
            )
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


@router.post("/extract-text")
async def extract_text_from_attachment(
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
):
    """Extract UTF-8 text from an uploaded file for the Copilot chat flow.

    Used by the Dashboard Copilot's chat-attachment path so binary formats
    (PDF / DOCX / PPTX) can be ingested as text into the agent run prompt.
    Plain-text formats (.txt / .md / .csv / .json) also work via this route.

    Returns: {"filename": str, "format": str, "chars": int, "text": str}
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read upload: {exc}")

    fname = file.filename or ""
    text = _extract_text_from_upload(
        contents,
        filename=fname,
        content_type=file.content_type or "",
    )

    name_lower = fname.lower()
    if name_lower.endswith(".pdf"):
        fmt = "pdf"
    elif name_lower.endswith(".docx"):
        fmt = "docx"
    elif name_lower.endswith(".pptx"):
        fmt = "pptx"
    elif name_lower.endswith(".md"):
        fmt = "md"
    elif name_lower.endswith(".csv"):
        fmt = "csv"
    elif name_lower.endswith(".json"):
        fmt = "json"
    else:
        fmt = "text"

    # ----- Diagnostic logging (Layer D) -----
    safe_preview = (text or "").replace("\n", " ")[:500]
    logger.info(
        "[upload.extract] filename=%r mime=%r size_bytes=%d format=%s extracted_chars=%d preview=%r",
        fname,
        file.content_type,
        len(contents),
        fmt,
        len(text or ""),
        safe_preview,
    )

    resp = {
        "filename": fname,
        "format": fmt,
        "chars": len(text or ""),
        "text": text or "",
    }

    # ----- Layer C: include raw bytes (base64) when extraction yielded little
    # or no text AND the file is PDF AND under the size cap. The runtime can
    # then route to Gemini multimodal. We only do this for PDFs in this layer;
    # DOCX/PPTX never need multimodal because their text path always works.
    EXTRACT_THRESHOLD = 50
    if (
        fmt == "pdf"
        and len((text or "").strip()) < EXTRACT_THRESHOLD
        and len(contents) <= settings.multimodal_max_bytes
    ):
        import base64 as _b64
        resp["raw_b64"] = _b64.b64encode(contents).decode("ascii")
        resp["mime"] = file.content_type or "application/pdf"
        resp["multimodal_eligible"] = True
        logger.info(
            "[upload.extract] raw_b64_included filename=%r size_bytes=%d cap_bytes=%d",
            fname, len(contents), settings.multimodal_max_bytes,
        )
    elif (
        fmt == "pdf"
        and len((text or "").strip()) < EXTRACT_THRESHOLD
        and len(contents) > settings.multimodal_max_bytes
    ):
        # Above cap: refuse to ship bytes; the runtime will fall through to the
        # received_but_empty stanza and tell the user honestly.
        resp["multimodal_eligible"] = False
        resp["mime"] = file.content_type or "application/pdf"
        logger.warning(
            "[upload.extract] over_size_cap filename=%r size_bytes=%d cap_bytes=%d",
            fname, len(contents), settings.multimodal_max_bytes,
        )

    return resp


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
            attached_doc_content=payload.attached_doc_content,
            attached_doc_b64=payload.attached_doc_b64,
            attached_doc_mime=payload.attached_doc_mime,
        )
        return run_log
    except Exception as exc:
        logger.exception("Error executing agent")
        raise HTTPException(
            status_code=500,
            detail=f"Error executing agent loop: {exc}"
        )
