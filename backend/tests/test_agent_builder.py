"""Pytest suite for the Agent Builder endpoints and firewall validations."""
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import User, Agent, AgentDocument, AgentDocumentChunk, AgentRun
from app.auth import get_current_user

from sqlalchemy.pool import StaticPool

# Setup isolated in-memory test database
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session():
    """Build database tables and tear them down after test run."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def fixture_client(db_session):
    """Overrides FastAPI dependencies for auth and db, yields TestClient."""
    # Seed mock test user
    user = User(
        email="executive@mdxblocks.com",
        hashed_password="mockhashedpassword",
        full_name="Executive Administrator",
        role="CFO",
        first_assessment_completed=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Apply overrides
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_current_user] = lambda: user
    
    with TestClient(app) as client:
        yield client
        
    app.dependency_overrides.clear()


# ============================================================
# 1. Test Available Capabilities & Role Templates
# ============================================================

def test_get_available_tools(client):
    response = client.get("/agents/tools")
    assert response.status_code == 200
    tools = response.json()
    assert isinstance(tools, list)
    assert "Web search" in tools
    assert "Doc retrieval" in tools
    assert "Score lookup" in tools


def test_get_role_templates(client):
    response = client.get("/agents/role-templates")
    assert response.status_code == 200
    templates = response.json()
    assert "ciso" in templates
    assert "cfo" in templates
    assert templates["ciso"]["icon"] == "ti-shield-check"
    assert templates["cfo"]["icon"] == "ti-building-bank"


# ============================================================
# 2. Test Agent CRUD & Scoring Firewall Invariant
# ============================================================

@patch("app.routers.agent_builder.create_vector_embedding")
@patch("app.agents.score_agent.calculate_scores")
@patch("app.routers.survey.calculate_dynamic_scores")
def test_agent_crud_and_firewall(
    mock_calc_dyn_scores,
    mock_calc_scores,
    mock_embed,
    client,
    db_session
):
    # Set mock return for embeddings
    mock_embed.return_value = [0.1] * 768

    # 1. CREATE Agent
    payload = {
        "name": "Vendor Audit Analyst",
        "description": "Scans vendor documents to check controls.",
        "instructions": "You are a governed security analyst. Flag missing policies.",
        "icon": "ti-shield-check",
        "role": "ciso",
        "model": "Gemini 2.5 · Vertex AI",
        "temperature": 0.2,
        "max_steps": 15,
        "tools": ["Web search", "Doc retrieval"]
    }
    
    response = client.post("/agents", json=payload)
    assert response.status_code == 201
    agent_data = response.json()
    agent_id = agent_data["id"]
    assert agent_data["name"] == "Vendor Audit Analyst"
    assert agent_data["role"] == "ciso"
    assert agent_data["temperature"] == 0.2
    assert agent_data["max_steps"] == 15
    assert agent_data["run_count"] == 0

    # 2. LIST Agents
    response = client.get("/agents")
    assert response.status_code == 200
    agents_list = response.json()
    assert len(agents_list) == 2
    assert any(a["id"] == agent_id for a in agents_list)
    assert any(a["role"] == "base" for a in agents_list)

    # 3. GET Single Agent
    response = client.get(f"/agents/{agent_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Vendor Audit Analyst"

    # 4. UPDATE Agent
    update_payload = {
        "name": "Vendor Audit Analyst v2",
        "temperature": 0.5
    }
    response = client.put(f"/agents/{agent_id}", json=update_payload)
    assert response.status_code == 200
    updated_data = response.json()
    assert updated_data["name"] == "Vendor Audit Analyst v2"
    assert updated_data["temperature"] == 0.5

    # 5. ATTACH/LINK URL Document Reference
    link_form = {
        "source_type": "sharepoint",
        "source_ref": "https://mdxblocks.sharepoint.com/doc.pdf"
    }
    response = client.post(f"/agents/{agent_id}/documents", data=link_form)
    assert response.status_code == 200
    doc_data = response.json()
    assert doc_data["source_type"] == "sharepoint"
    assert doc_data["status"] == "linked/queued"

    # 6. UPLOAD Local Text Document (Simulated Indexing)
    file_content = "This is compliance governance rule number five. Secure all data classifications."
    file_payload = {
        "source_type": "local",
        "source_ref": "governance.txt"
    }
    files = {"file": ("governance.txt", file_content, "text/plain")}
    response = client.post(f"/agents/{agent_id}/documents", data=file_payload, files=files)
    assert response.status_code == 200
    local_doc_data = response.json()
    assert local_doc_data["source_type"] == "local"
    assert local_doc_data["status"] == "indexed"

    # Check that chunks were indexed into database
    chunks = db_session.query(AgentDocumentChunk).filter(AgentDocumentChunk.agent_document_id == local_doc_data["id"]).all()
    assert len(chunks) > 0
    assert chunks[0].text.startswith("This is compliance")

    # 7. RUN / EXECUTE Agent
    run_payload = {
        "input": "Check compliance of active documents"
    }
    response = client.post(f"/agents/{agent_id}/run", json=run_payload)
    assert response.status_code == 200
    run_data = response.json()
    assert run_data["agent_id"] == agent_id
    assert run_data["status"] == "completed"
    assert len(run_data["steps"]) > 0
    # Steps trace must be documented and include simulated stubs labels
    assert any("[Simulated" in step["detail"] for step in run_data["steps"])

    # 8. DELETE Agent
    response = client.delete(f"/agents/{agent_id}")
    assert response.status_code == 204
    # Fetching deleted agent must return 404
    response = client.get(f"/agents/{agent_id}")
    assert response.status_code == 404

    # 9. FIREWALL ASSERTIONS
    # Verify that the role configurations and run requests NEVER reached the scoring engine
    assert mock_calc_scores.called is False
    assert mock_calc_dyn_scores.called is False


def test_base_agent_auto_creation_and_protection(client, db_session):
    # 1. LIST agents should auto-create the base agent since none exists
    response = client.get("/agents")
    assert response.status_code == 200
    agents_list = response.json()
    assert len(agents_list) == 1
    base_agent = agents_list[0]
    assert base_agent["role"] == "base"
    assert base_agent["name"] == "AI Readiness Copilot"
    base_agent_id = base_agent["id"]

    # 2. Try to update base agent - should fail with 400
    update_payload = {"name": "Malicious Name"}
    response = client.put(f"/agents/{base_agent_id}", json=update_payload)
    assert response.status_code == 400
    assert "Cannot modify the base agent" in response.json()["detail"]

    # 3. Try to delete base agent - should fail with 400
    response = client.delete(f"/agents/{base_agent_id}")
    assert response.status_code == 400
    assert "Cannot delete the base agent" in response.json()["detail"]

    # 4. Try to run base agent
    run_payload = {
        "input": "Explain my score"
    }
    response = client.post(f"/agents/{base_agent_id}/run", json=run_payload)
    assert response.status_code == 200
    run_data = response.json()
    assert run_data["agent_id"] == base_agent_id
    assert run_data["status"] == "completed"



# ============================================================
# Phase: PDF / DOCX extraction via _extract_text_from_upload
# ============================================================

def _make_pdf_bytes(_text: str = "") -> bytes:
    """Build a valid PDF in-memory via pypdf's own writer.

    Note: an empty/blank PDF is sufficient — the test verifies the route
    succeeds and returns a well-formed response with format='pdf'. Asserting
    on extracted text would require ReportLab (extra dep we don't want).
    """
    from io import BytesIO
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buf = BytesIO()
    writer.write(buf)
    return buf.getvalue()


def _make_docx_bytes(text: str = "Hello world from a docx test file.") -> bytes:
    from io import BytesIO
    from docx import Document
    doc = Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_extract_text_endpoint_with_pdf(client):
    """POST /agents/extract-text returns text from a PDF upload."""
    pdf_bytes = _make_pdf_bytes("Quarterly governance update")
    response = client.post(
        "/agents/extract-text",
        files={"file": ("report.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "pdf"
    assert data["filename"] == "report.pdf"
    assert isinstance(data["text"], str)
    # Extraction may yield empty string for hand-crafted PDFs without proper
    # encoding tables; the route still must succeed and return well-formed JSON.
    assert "chars" in data


def test_extract_text_endpoint_with_docx(client):
    """POST /agents/extract-text returns text from a DOCX upload."""
    docx_bytes = _make_docx_bytes("Policy committee minutes from Q3.")
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "minutes.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "docx"
    assert "Policy committee minutes" in data["text"]
    assert data["chars"] > 0


def test_extract_text_endpoint_plaintext_fallback(client):
    """POST /agents/extract-text returns text from a plain .txt upload."""
    response = client.post(
        "/agents/extract-text",
        files={"file": ("notes.txt", b"hello plain text body", "text/plain")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "text"
    assert data["text"] == "hello plain text body"


# ============================================================
# Phase: Attachment grounding in agent_runtime (Layer A)
# ============================================================

def test_run_with_attached_text_lands_in_system_prompt(client, db_session, monkeypatch):
    """When attached_doc_content is non-empty, system prompt must contain
    ATTACHED DOCUMENT (CURRENT TURN) + the actual text + the do-not-refuse line.

    Note: complete_json is called twice per run — once by the agent loop and
    once by generate_dynamic_follow_ups. We capture all calls and assert on
    the first (the agent loop's).
    """
    calls = []

    def fake_complete_json(system_prompt, user_message, max_tokens=1000):
        calls.append({"system_prompt": system_prompt, "user_message": user_message})
        # First call (agent loop) returns a final answer; subsequent calls
        # (follow-up generator) get a benign JSON array.
        if len(calls) == 1:
            return '{"thought": "ok", "final_answer": "From the attached document, the score is 24/100."}'
        return '["follow up?"]'

    monkeypatch.setattr("app.agents.agent_runtime.complete_json", fake_complete_json)
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "test-key")

    # Auto-create base agent
    response = client.get("/agents")
    assert response.status_code == 200
    base_agent_id = response.json()[0]["id"]

    response = client.post(
        f"/agents/{base_agent_id}/run",
        json={
            "input": "What is the score?",
            "history": [],
            "attached_doc_ref": "Northwind Health Systems-v1-Jun13.pdf",
            "attached_doc_content": "Northwind Health Systems AI Readiness Report. Score: 24/100. Tier: Foundational.",
        },
    )
    assert response.status_code == 200, response.text
    assert len(calls) >= 1, "complete_json was never invoked by the agent loop"

    sp = calls[0]["system_prompt"] or ""
    um = calls[0]["user_message"] or ""
    assert "--- ATTACHED DOCUMENT (CURRENT TURN) ---" in sp
    assert "Northwind Health Systems-v1-Jun13.pdf" in sp
    assert "Score: 24/100" in sp
    assert "Do NOT say you cannot read uploaded files" in sp
    # User message bridge
    assert "ATTACHED DOCUMENT (CURRENT TURN)" in um
    assert "the user attached" in um.lower()


def test_run_with_attachment_ref_only_explains_unreadable(client, db_session, monkeypatch):
    """When attached_doc_content is empty (scanned/image PDF), system prompt
    must contain the 'NOTE TO MODEL' stanza telling Gemini to explain honestly.
    """
    calls = []

    def fake_complete_json(system_prompt, user_message, max_tokens=1000):
        calls.append({"system_prompt": system_prompt, "user_message": user_message})
        if len(calls) == 1:
            return '{"thought": "ok", "final_answer": "The file came through but its content could not be parsed."}'
        return '["follow up?"]'

    monkeypatch.setattr("app.agents.agent_runtime.complete_json", fake_complete_json)
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "test-key")

    response = client.get("/agents")
    base_agent_id = response.json()[0]["id"]

    response = client.post(
        f"/agents/{base_agent_id}/run",
        json={
            "input": "What is the score?",
            "history": [],
            "attached_doc_ref": "scan-only.pdf",
            "attached_doc_content": "",
        },
    )
    assert response.status_code == 200, response.text
    assert len(calls) >= 1, "complete_json was never invoked by the agent loop"

    sp = calls[0]["system_prompt"] or ""
    um = calls[0]["user_message"] or ""
    assert "--- ATTACHED DOCUMENT (CURRENT TURN) ---" in sp
    assert "scan-only.pdf" in sp
    assert "NOTE TO MODEL" in sp
    assert "no text could be extracted" in sp
    # User-message bridge for the unreadable case
    assert "no text could be extracted" in um.lower() or "couldn't be parsed" in um.lower()


# ============================================================
# Phase: Layer C — Gemini multimodal PDF ingestion
# ============================================================

def test_extract_text_returns_b64_when_pdf_extraction_empty(client):
    """When pypdf+pdfminer both return <50 chars on a PDF, the extract
    response must include raw_b64 + mime + multimodal_eligible."""
    pdf_bytes = _make_pdf_bytes()  # blank-page PDF — extracts to ""
    response = client.post(
        "/agents/extract-text",
        files={"file": ("blank.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "pdf"
    assert data["chars"] < 50
    assert "raw_b64" in data
    assert len(data["raw_b64"]) > 0
    assert data["mime"] == "application/pdf"
    assert data["multimodal_eligible"] is True


def test_extract_text_omits_b64_when_extraction_succeeds(client):
    """When text extraction yields a meaningful body, the response must NOT
    include raw_b64 (no need for multimodal)."""
    response = client.post(
        "/agents/extract-text",
        files={"file": ("notes.txt",
                        b"this is a long enough plain text body to clear the threshold of fifty characters easily",
                        "text/plain")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["chars"] >= 50
    assert "raw_b64" not in data
    assert "multimodal_eligible" not in data


def test_run_with_multimodal_attachment_invokes_complete_json_multimodal(
    client, db_session, monkeypatch
):
    """Empty text + b64 + MULTIMODAL_ENABLED=True must route to
    complete_json_multimodal with the decoded bytes."""
    import base64 as _b64
    calls = {"text": [], "multimodal": []}

    def fake_complete_json(system_prompt, user_message, max_tokens=1000):
        calls["text"].append((system_prompt, user_message))
        return '{"thought": "ok", "final_answer": "answered from text path"}'

    def fake_complete_json_multimodal(system_prompt, user_message,
                                      file_bytes, file_mime,
                                      max_tokens=2000):
        calls["multimodal"].append({
            "system_prompt": system_prompt,
            "user_message": user_message,
            "file_bytes": file_bytes,
            "file_mime": file_mime,
        })
        return '{"thought": "read pdf", "final_answer": "AI Readiness Score: 24/100. Tier: Foundational."}'

    monkeypatch.setattr("app.agents.agent_runtime.complete_json", fake_complete_json)
    monkeypatch.setattr(
        "app.agents.agent_runtime.complete_json_multimodal",
        fake_complete_json_multimodal,
        raising=False,
    )
    # Force the lazy import in agent_runtime to find the patched symbol
    import app.agents.llm_client as _lc
    monkeypatch.setattr(_lc, "complete_json_multimodal",
                        fake_complete_json_multimodal, raising=False)
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "vertex")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "test-project")
    monkeypatch.setattr("app.agents.agent_runtime.settings.multimodal_enabled", True)

    response = client.get("/agents")
    base_agent_id = response.json()[0]["id"]

    sample_bytes = b"%PDF-1.4 fake pdf bytes for the test only"
    response = client.post(
        f"/agents/{base_agent_id}/run",
        json={
            "input": "What is the score?",
            "history": [],
            "attached_doc_ref": "Northwind Health Systems-v1-Jun13.pdf",
            "attached_doc_content": "",
            "attached_doc_b64": _b64.b64encode(sample_bytes).decode("ascii"),
            "attached_doc_mime": "application/pdf",
        },
    )
    assert response.status_code == 200, response.text
    assert len(calls["multimodal"]) == 1, (
        "Expected multimodal path to be invoked exactly once. "
        f"text_calls={len(calls['text'])} multimodal_calls={len(calls['multimodal'])}"
    )
    mm = calls["multimodal"][0]
    assert mm["file_bytes"] == sample_bytes
    assert mm["file_mime"] == "application/pdf"
    assert "MULTIMODAL" in mm["system_prompt"]
    assert "Northwind Health Systems-v1-Jun13.pdf" in mm["system_prompt"]
    # Outcome must surface to the run row
    assert "24/100" in response.json()["outcome"]


def test_run_with_b64_but_multimodal_disabled_falls_back_honestly(
    client, db_session, monkeypatch
):
    """When MULTIMODAL_ENABLED=False, empty text + b64 must NOT call the
    multimodal path and must use the received_but_empty stanza."""
    import base64 as _b64
    text_calls = []
    multimodal_calls = []

    def fake_complete_json(system_prompt, user_message, max_tokens=1000):
        text_calls.append((system_prompt, user_message))
        return '{"thought": "ok", "final_answer": "honest fallback"}'

    def fake_complete_json_multimodal(system_prompt, user_message,
                                      file_bytes, file_mime,
                                      max_tokens=2000):
        multimodal_calls.append("UNEXPECTED")
        return '{"thought": "should not be called", "final_answer": "WRONG"}'

    monkeypatch.setattr("app.agents.agent_runtime.complete_json", fake_complete_json)
    import app.agents.llm_client as _lc
    monkeypatch.setattr(_lc, "complete_json_multimodal",
                        fake_complete_json_multimodal, raising=False)
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "vertex")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "test-project")
    # FLAG OFF
    monkeypatch.setattr("app.agents.agent_runtime.settings.multimodal_enabled", False)

    response = client.get("/agents")
    base_agent_id = response.json()[0]["id"]

    response = client.post(
        f"/agents/{base_agent_id}/run",
        json={
            "input": "What is the score?",
            "history": [],
            "attached_doc_ref": "scan-only.pdf",
            "attached_doc_content": "",
            "attached_doc_b64": _b64.b64encode(b"%PDF-1.4 bytes").decode("ascii"),
            "attached_doc_mime": "application/pdf",
        },
    )
    assert response.status_code == 200, response.text
    assert multimodal_calls == [], "Multimodal must NOT be invoked when flag is off"
    assert len(text_calls) >= 1
    sp = text_calls[0][0]
    # Honest fallback stanza in the system prompt
    assert "no text could be extracted" in sp
    assert "multimodal ingestion is disabled" in sp.lower() or "received but its content could not be parsed" in sp.lower()
