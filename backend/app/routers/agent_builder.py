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


# Legacy Word .doc files (OLE Compound File Binary Format) start with this
# magic header. Used to detect renamed-to-.docx files so we can reject them
# with a clear message instead of letting python-docx raise BadZipFile.
_OLE_CFB_MAGIC = b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"


def _extract_docx(content: bytes) -> str:
    """Extract a DOCX in true body order with merged-cell dedup and headers/footers.

    Walks ``doc.element.body`` so paragraphs and tables appear in the order
    they live in the document, not paragraphs-first / tables-after. Merged
    cells (which python-docx returns multiple times when iterating row.cells)
    are deduped by tracking the underlying ``<w:tc>`` element identity.
    Headers and footers from every section are appended at the end under
    clearly labelled markers so the LLM can attribute them.
    """
    import io
    from docx import Document
    from docx.oxml.ns import qn

    doc = Document(io.BytesIO(content))
    body = doc.element.body
    parts: list[str] = []

    p_tag = qn("w:p")
    tbl_tag = qn("w:tbl")

    # Build paragraph and table lookups so we can map XML elements back to
    # python-docx wrappers (which carry .text and .rows).
    from docx.text.paragraph import Paragraph
    from docx.table import Table

    for child in body.iterchildren():
        if child.tag == p_tag:
            text = Paragraph(child, doc).text
            if text and text.strip():
                parts.append(text)
        elif child.tag == tbl_tag:
            table = Table(child, doc)
            rendered_rows: list[str] = []
            for row in table.rows:
                seen_tc_ids: set[int] = set()
                cell_texts: list[str] = []
                for cell in row.cells:
                    # cell._tc is the underlying <w:tc>; merged cells share
                    # the same element across multiple row.cells visits.
                    tc_id = id(cell._tc)
                    if tc_id in seen_tc_ids:
                        continue
                    seen_tc_ids.add(tc_id)
                    txt = (cell.text or "").strip()
                    cell_texts.append(txt)
                if any(cell_texts):
                    rendered_rows.append(" | ".join(cell_texts))
            if rendered_rows:
                parts.append("[Table]\n" + "\n".join(rendered_rows))

    # Headers and footers per section. Most docs have one section, but we
    # walk all of them to capture different first-page / odd / even headers
    # where the author has set them up.
    for section in doc.sections:
        for label, hf in (("Header", section.header), ("Footer", section.footer)):
            hf_text = "\n".join(
                p.text for p in hf.paragraphs if p.text and p.text.strip()
            )
            if hf_text.strip():
                parts.append(f"[{label}]\n{hf_text}")

    return "\n\n".join(parts)


def _extract_pptx(content: bytes) -> str:
    """Extract a PPTX with per-slide markers, table walking, notes, and group recursion."""
    import io
    from pptx import Presentation
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    prs = Presentation(io.BytesIO(content))
    out: list[str] = []

    def _walk_shapes(shapes) -> list[str]:
        local: list[str] = []
        for shape in shapes:
            # Grouped shape: recurse into children.
            if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
                local.extend(_walk_shapes(shape.shapes))
                continue
            # Table shape: walk rows × cells.
            if getattr(shape, "has_table", False):
                rendered_rows: list[str] = []
                for row in shape.table.rows:
                    cells = [(c.text or "").strip() for c in row.cells]
                    if any(cells):
                        rendered_rows.append(" | ".join(cells))
                if rendered_rows:
                    local.append("[Table]\n" + "\n".join(rendered_rows))
                continue
            # Plain text shape (placeholder, text box, etc.).
            txt = getattr(shape, "text", "")
            if txt and txt.strip():
                local.append(txt)
        return local

    for idx, slide in enumerate(prs.slides, start=1):
        slide_parts = [f"[Slide {idx}]"]
        slide_parts.extend(_walk_shapes(slide.shapes))
        # Speaker notes.
        if getattr(slide, "has_notes_slide", False) and slide.has_notes_slide:
            try:
                notes_text = slide.notes_slide.notes_text_frame.text or ""
                if notes_text.strip():
                    slide_parts.append(f"[Notes]\n{notes_text}")
            except Exception:
                pass
        if len(slide_parts) > 1:
            out.append("\n".join(slide_parts))

    return "\n\n".join(out)


def _extract_csv(content: bytes) -> str:
    """Render a CSV as an aligned table the LLM can read column-by-column.

    Detects the delimiter via csv.Sniffer when possible (handles ``;`` and
    ``\\t``-separated exports). Falls back to comma. Encoding errors degrade
    to ``replace`` rather than ``ignore`` so accented characters survive
    instead of silently disappearing.
    """
    import csv
    import io

    # Try utf-8-sig first to strip BOMs from Excel exports, then cp1252 as
    # a fallback. Anything still undecodable becomes U+FFFD ("?"), which is
    # visible rather than silently dropped.
    text = None
    for encoding in ("utf-8-sig", "cp1252"):
        try:
            text = content.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        text = content.decode("utf-8", errors="replace")

    sample = text[:4096]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel  # comma

    reader = csv.reader(io.StringIO(text), dialect=dialect)
    rows = [row for row in reader if any((c or "").strip() for c in row)]
    if not rows:
        return ""

    # Aligned columns. Cap width per column so a single huge cell doesn't
    # blow the prompt; the LLM only needs structure, not pixel alignment.
    n_cols = max(len(r) for r in rows)
    widths = [0] * n_cols
    for r in rows:
        for i, cell in enumerate(r):
            widths[i] = min(60, max(widths[i], len(cell)))

    def fmt_row(r):
        return " | ".join(
            (cell if len(cell) <= 60 else cell[:57] + "...").ljust(widths[i])
            for i, cell in enumerate(r + [""] * (n_cols - len(r)))
        )

    header = fmt_row(rows[0])
    sep = "-+-".join("-" * w for w in widths)
    body_rows = "\n".join(fmt_row(r) for r in rows[1:])
    return f"{header}\n{sep}\n{body_rows}" if body_rows else header


def _extract_json(content: bytes) -> str:
    """Pretty-print JSON with indent=2. Falls back to raw text on parse failure."""
    raw = content.decode("utf-8", errors="replace")
    try:
        parsed = json.loads(raw)
        return json.dumps(parsed, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.warning("[upload.extract] json parse failed; shipping raw text: %s", exc)
        return raw


def _extract_text_from_upload(content: bytes, filename: str = "", content_type: str = "") -> str:
    """Extract UTF-8 plain text from an uploaded file's raw bytes.

    Supports .pdf (pypdf → pdfminer chain), .docx (python-docx, body-order),
    .pptx (python-pptx, with slide numbers + notes + tables + group recursion),
    .csv (sniffed delimiter + aligned table), .json (pretty-printed), and
    plain-text family (.txt, .md) via UTF-8 decode. Dispatches on filename
    extension first, falls back to content_type sniffing.

    Legacy .doc files (OLE Compound File Binary) are detected by extension
    and by magic-byte sniff (in case the user renamed .doc → .docx) and
    rejected with a clear 415 message.

    Returns extracted text. Raises HTTPException(415) on parse failure.
    """
    name = (filename or "").lower()
    ct = (content_type or "").lower()

    def _ext_matches(*exts):
        return any(name.endswith(e) for e in exts)

    # --- Legacy .doc rejection (extension OR OLE CFB magic on a .docx-named file) ---
    if _ext_matches(".doc") or content[: len(_OLE_CFB_MAGIC)] == _OLE_CFB_MAGIC:
        raise HTTPException(
            status_code=415,
            detail=".doc is not supported. Please upload .docx.",
        )

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
            return _extract_docx(content)
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning("DOCX extraction failed for %r: %s", filename, exc)
            raise HTTPException(status_code=415, detail=f"Failed to parse DOCX: {exc}")

    # --- PPTX ---
    if _ext_matches(".pptx") or "presentationml" in ct:
        try:
            return _extract_pptx(content)
        except Exception as exc:
            logger.warning("PPTX extraction failed for %r: %s", filename, exc)
            raise HTTPException(status_code=415, detail=f"Failed to parse PPTX: {exc}")

    # --- CSV (pretty-print) ---
    if _ext_matches(".csv") or "csv" in ct:
        return _extract_csv(content)

    # --- JSON (pretty-print) ---
    if _ext_matches(".json") or "json" in ct:
        return _extract_json(content)

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
            previous_follow_ups=payload.previous_follow_ups,
        )
        return run_log
    except Exception as exc:
        logger.exception("Error executing agent")
        raise HTTPException(
            status_code=500,
            detail=f"Error executing agent loop: {exc}"
        )
