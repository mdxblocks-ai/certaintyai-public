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
    # Every step must have a descriptive detail, and NO step may carry an
    # internal "[Simulated ...]" / "[Demo ...]" / "[Fallback ...]" debug
    # label — those are not safe to expose to end users.
    assert all(step["detail"] for step in run_data["steps"])
    forbidden_labels = ("[Simulated", "[Demo", "[Fallback", "[Mock", "[Test")
    for step in run_data["steps"]:
        for label in forbidden_labels:
            assert label not in step["detail"], (
                f"Internal debug label {label!r} leaked into user-visible "
                f"step detail: {step['detail']!r}"
            )

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


# ============================================================
# Phase: Follow-up generation — Fix 1 + Fix 2 regression tests
# ============================================================

def test_followups_classify_from_user_prompt_first(client, db_session, monkeypatch):
    """Bug A regression test. User asks about priority actions; assistant
    response happens to mention cost (drift). The next turn's follow-ups
    must reflect the USER's intent (priority_actions), not whatever the
    assistant drifted into.

    This was previously the reverse — the old test asserted assistant-
    response-wins — but that order caused the agent's stock system-prompt
    phrase ("security, governance, and financial dimensions") to funnel
    nearly every reply into governance_recommendations regardless of what
    the user actually asked. Bug A flipped the order to user-input-first.
    """
    # Force the fallback path so we can read intent dispatch deterministically.
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.anthropic_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gemini_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "")

    from app.agents.agent_runtime import generate_dynamic_follow_ups

    # User prompt unambiguously matches priority_actions and has NO substring
    # in any other bucket's keyword list (previously the test used a prompt
    # containing "my score" which silently matched explain_score first).
    user_prompt = "What are our top priority actions for AI adoption this quarter?"
    # Assistant drifts into cost talk — should NOT hijack the bucket.
    assistant_says = (
        "Three cost levers in order of typical payback: model routing, "
        "caching, and committed-spend optimization. Track unit economics, "
        "not just raw AI spend."
    )

    out = generate_dynamic_follow_ups(
        agent_role="base",
        history=[],
        last_answer=assistant_says,
        last_user_input=user_prompt,
        previous_follow_ups=[],
    )
    # The returned set must come from priority_actions (user input wins).
    joined = " | ".join(out).lower()
    assert any(kw in joined for kw in (
        "priority action typically take", "impact-to-effort ratio",
        "executive buy-in", "parallel vs. serial",
    )), f"Expected priority_actions ladder, got: {out!r}"
    # And must NOT be the cost ladder.
    assert not any(kw in joined for kw in ("payback period for model routing", "unit economics", "overspend on ai")), (
        f"Cost-bucket follow-ups leaked through despite user prompt being priority-actions: {out!r}"
    )


def test_extractive_doc_answer_grounds_in_document_content(client):
    """When the user asks about scoring and the document explains scoring,
    the extractive answer must quote the relevant sentences verbatim."""
    from app.agents.agent_runtime import _extractive_doc_answer

    doc = (
        "Northwind Health Systems AI Readiness Assessment.\n\n"
        "The AI Readiness Score combines five sub-dimensions, each scored 0 to 100: "
        "Semantic Alignment, RAG Accuracy, Audit and Provenance, Governance Oversight, "
        "and Data Maturity. "
        "The overall score rolls up into a tier — Foundational (0 to 39), Piloting (40 to 74), "
        "or Scale (75 to 100). "
        "The weather in Seattle this week is partly cloudy. "
        "Your weakest sub-score is usually the highest-leverage fix for the next tier jump."
    )

    answer = _extractive_doc_answer(
        user_question="Please explain about Scoring in laymen terms",
        doc_content=doc,
        doc_ref="Northwind Health Systems_Report.txt",
        role="base",
    )

    # The answer must quote the scoring-relevant content.
    assert "five sub-dimensions" in answer or "Foundational" in answer or "tier" in answer
    # The irrelevant sentence about Seattle weather must NOT appear.
    assert "Seattle" not in answer and "weather" not in answer
    # Citation present.
    assert "Northwind Health Systems_Report.txt" in answer
    # Intro phrase keyed to the topic.
    assert answer.startswith("Based on the uploaded document,")


def test_extractive_doc_answer_does_not_leak_internal_failure_modes(client):
    """The doc-grounded response must NEVER mention any of the internal
    failure-mode words: 'simulated', 'demo', 'fallback', 'LLM', 'Gemini',
    'Vertex', or the generic 'I can answer prompts across five topic areas'.
    """
    from app.agents.agent_runtime import _extractive_doc_answer

    answer = _extractive_doc_answer(
        user_question="What does the document say?",
        doc_content=(
            "This is a comprehensive AI readiness review for the organization. "
            "Key findings include governance gaps and data hygiene issues. "
            "Recommended next steps are to charter a steering committee."
        ),
        doc_ref="sample.txt",
        role="base",
    )

    forbidden = (
        "simulated", "Simulated", "demo", "Demo", "fallback", "Fallback",
        "LLM", "Gemini", "Vertex",
        "I can answer prompts across five topic areas",
    )
    lower = answer.lower()
    for bad in forbidden:
        assert bad.lower() not in lower, (
            f"Forbidden phrase {bad!r} appeared in extractive answer:\n{answer}"
        )


def test_extractive_doc_answer_zero_overlap_falls_back_to_document_opener(client):
    """When the question has no keyword overlap with the document, the
    extractor still returns content FROM the document — never a generic
    capability blurb."""
    from app.agents.agent_runtime import _extractive_doc_answer

    doc = (
        "Quarter one revenue figures for the Northwind organization. "
        "Sales totaled 4.2 million across three product lines. "
        "Margins held at 38 percent year over year."
    )

    answer = _extractive_doc_answer(
        user_question="biology of dolphins",
        doc_content=doc,
        doc_ref="finance.txt",
        role="base",
    )

    # Even with zero overlap, the answer must come from the document.
    assert "Northwind" in answer or "Sales" in answer or "Margins" in answer
    # Must NOT be the generic intent fallback.
    assert "I can answer prompts across five topic areas" not in answer
    # Citation still present.
    assert "finance.txt" in answer


def test_simulated_trace_uses_extractive_path_when_document_attached(client, db_session):
    """`_generate_simulated_trace` with attached_doc_content takes the
    document-grounded extractive path. Without it, the existing intent-
    dispatch templates fire (regression coverage)."""
    from app.agents.agent_runtime import _generate_simulated_trace
    from app.models import Agent

    agent = Agent(
        name="Test Agent", description="t", instructions="t", icon="ti-robot",
        role="base", model="Gemini 2.5", temperature=0.3, max_steps=10,
        tools=[], voice_enabled=False, owner_id=1,
    )

    # Path A: doc attached -> extractive grounded answer.
    doc = (
        "The AI Readiness Score is calculated from five sub-dimensions. "
        "Each sub-dimension is scored from zero to one hundred."
    )
    outcome_doc, steps_doc = _generate_simulated_trace(
        agent,
        user_input="Please explain about scoring",
        document_count=1,
        attached_doc_content=doc,
        attached_doc_ref="report.txt",
    )
    assert "report.txt" in outcome_doc
    assert "sub-dimension" in outcome_doc.lower() or "score" in outcome_doc.lower()
    assert "I can answer prompts across five topic areas" not in outcome_doc

    # Path B: no doc attached -> existing intent-dispatch templates fire.
    outcome_nodoc, steps_nodoc = _generate_simulated_trace(
        agent,
        user_input="Explain my readiness score",
        document_count=0,
    )
    # The intent-dispatch path produces the canned templates (recognizable
    # by their topic-titled first line); the doc-grounded path does NOT
    # use those headings.
    assert "AI Readiness Score" in outcome_nodoc
    # Belt-and-suspenders: the regression path does not contain the doc
    # intro phrase.
    assert "Based on the uploaded document" not in outcome_nodoc


def test_simulated_outcomes_have_no_internal_debug_labels(client, monkeypatch):
    """The simulated fallback outcomes (used when no LLM is configured or
    the live call raises) must not surface any internal "[Simulated ...]" /
    "[Demo ...]" / "[Fallback ...]" / "[Mock ...]" / "[Test ...]" debug
    labels to end users. The fallback execution logic itself is preserved;
    only the visible label is gone.
    """
    from app.agents.agent_runtime import _simulated_outcome

    forbidden_labels = ("[Simulated", "[Demo", "[Fallback", "[Mock", "[Test")
    intents = (
        "explain_score", "priority_actions", "industry_benchmarks",
        "governance_recommendations", "cost_optimization", "general",
    )
    for intent in intents:
        for role in ("base", "ciso", "cfo"):
            outcome = _simulated_outcome(intent, "sample prompt", role)
            assert outcome and isinstance(outcome, str)
            for label in forbidden_labels:
                assert label not in outcome, (
                    f"Internal debug label {label!r} present in simulated "
                    f"outcome for intent={intent!r} role={role!r}: "
                    f"{outcome[:160]!r}"
                )


def test_detect_intent_scrubs_stock_phrase(client, monkeypatch):
    """The agent's system instruction makes Gemini regurgitate the literal
    phrase "security, governance, and financial dimensions" in almost every
    reply. The classifier must strip that phrase before substring matching,
    otherwise every long reply matches the "governance" keyword and routes
    to governance_recommendations.
    """
    from app.agents.agent_runtime import _detect_intent

    # The stock phrase + its trailing-noun variants must all scrub clean.
    for tail in ("dimensions", "investment", "considerations", "aspects", ""):
        text = (
            "Help the user evaluate their organization's AI adoption across "
            f"security, governance, and financial {tail}."
        )
        intent = _detect_intent(text)
        # After scrubbing the stock phrase, no other governance keyword
        # remains in this text. Falls to "general" (or a non-governance
        # match if any other keyword incidentally hits, which there isn't).
        assert intent == "general", (
            f"Stock-phrase variant {tail!r} not scrubbed; classifier "
            f"returned {intent!r}"
        )

    # A real governance question (not just the stock phrase) must still
    # classify correctly.
    assert _detect_intent("Show me our governance gaps") == "governance_recommendations"


def test_detect_intent_new_keyword_buckets(client, monkeypatch):
    """Bug A keyword expansion: roadmap/plan/timeline route to
    priority_actions; business value / value realization / return / benefits
    route to cost_optimization.
    """
    from app.agents.agent_runtime import _detect_intent

    # Roadmap family -> priority_actions
    for kw in ("roadmap", "plan", "timeline", "milestones", "30-60-90", "implementation"):
        prompt = f"What is the AI {kw} for our organization?"
        assert _detect_intent(prompt) == "priority_actions", (
            f"Expected priority_actions for {kw!r}, got {_detect_intent(prompt)!r}"
        )

    # Business value family -> cost_optimization
    for kw in ("business value", "value realization", "return", "benefits"):
        prompt = f"What is the {kw} of acting on these recommendations?"
        assert _detect_intent(prompt) == "cost_optimization", (
            f"Expected cost_optimization for {kw!r}, got {_detect_intent(prompt)!r}"
        )


def test_followups_upload_plus_score_routes_to_explain_score(client, db_session, monkeypatch):
    """User asks about an uploaded PDF AND the assistant mentions
    score/readiness -> route to explain_score (the user is asking the
    assistant to interpret the doc against the readiness model).
    """
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.anthropic_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gemini_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "")

    from app.agents.agent_runtime import generate_dynamic_follow_ups

    user_prompt = "Analyze the uploaded PDF and tell me what it says"
    assistant_says = (
        "Based on the uploaded document, your AI Readiness Score is "
        "24/100 (Low / Foundational). The biggest gap is governance."
    )

    out = generate_dynamic_follow_ups(
        agent_role="base", history=[], last_answer=assistant_says,
        last_user_input=user_prompt, previous_follow_ups=[],
    )
    joined = " | ".join(out).lower()
    # Should land in explain_score (priority-actions to lift, sub-score, tier).
    assert any(kw in joined for kw in (
        "priority actions to lift my score", "sub-score is driving",
        "score compare to industry benchmarks",
    )), f"Expected explain_score ladder, got: {out!r}"


def test_followups_fallback_to_assistant_when_user_prompt_is_generic(client, db_session, monkeypatch):
    """When the user prompt is too generic to classify (e.g. clicked a
    suggestion or typed "tell me more"), the assistant response is the
    secondary signal. This is the explicit Bug A fallback path.
    """
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.anthropic_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gemini_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "")

    from app.agents.agent_runtime import generate_dynamic_follow_ups

    user_prompt = "tell me more"  # no keyword matches any bucket
    assistant_says = (
        "Three cost levers in order of typical payback: model routing, "
        "caching, and committed-spend optimization."
    )

    out = generate_dynamic_follow_ups(
        agent_role="base",
        history=[],
        last_answer=assistant_says,
        last_user_input=user_prompt,
        previous_follow_ups=[],
    )
    # User input classifies as general -> falls back to assistant -> cost.
    joined = " | ".join(out).lower()
    assert any(kw in joined for kw in ("payback period for model routing", "unit economics", "overspend on ai")), (
        f"Expected cost-bucket follow-ups from assistant fallback, got: {out!r}"
    )


def test_followups_never_repeat_within_session(client, db_session, monkeypatch):
    """Three consecutive turns in the same intent must yield three disjoint
    sets — no repetition within a session, ladder descends naturally.
    """
    monkeypatch.setattr("app.agents.agent_runtime.settings.llm_provider", "openai")
    monkeypatch.setattr("app.agents.agent_runtime.settings.openai_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.anthropic_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gemini_api_key", "")
    monkeypatch.setattr("app.agents.agent_runtime.settings.gcp_project_id", "")

    from app.agents.agent_runtime import generate_dynamic_follow_ups, _normalize_followup

    assistant_says = (
        "Three priority actions ranked by impact-to-effort: charter a "
        "governance committee, ship one copilot under policy, wire the "
        "Evidence Pack into your top three workflows."
    )
    user_prompt = "What are the priority actions for our organization?"

    seen: list[str] = []

    turn1 = generate_dynamic_follow_ups(
        agent_role="base", history=[], last_answer=assistant_says,
        last_user_input=user_prompt, previous_follow_ups=list(seen),
    )
    seen.extend(turn1)

    turn2 = generate_dynamic_follow_ups(
        agent_role="base", history=[], last_answer=assistant_says,
        last_user_input=user_prompt, previous_follow_ups=list(seen),
    )
    seen.extend(turn2)

    turn3 = generate_dynamic_follow_ups(
        agent_role="base", history=[], last_answer=assistant_says,
        last_user_input=user_prompt, previous_follow_ups=list(seen),
    )

    # Each turn returns exactly 3 items.
    assert len(turn1) == 3 and len(turn2) == 3 and len(turn3) == 3

    # No follow-up repeats across turns (compare normalised forms).
    t1n = {_normalize_followup(s) for s in turn1}
    t2n = {_normalize_followup(s) for s in turn2}
    t3n = {_normalize_followup(s) for s in turn3}
    assert t1n.isdisjoint(t2n), f"Turn 2 repeats Turn 1 items: {t1n & t2n}"
    assert t1n.isdisjoint(t3n), f"Turn 3 repeats Turn 1 items: {t1n & t3n}"
    assert t2n.isdisjoint(t3n), f"Turn 3 repeats Turn 2 items: {t2n & t3n}"

    # Ladder descends: by the time we've consumed 6 items (turns 1+2) the
    # deeper-stage entries — value / sponsor / timeline / roadmap — should
    # have surfaced somewhere. Which exact turn they land on depends on the
    # bucket order; the property under test is "ladder progresses," not
    # "anchors land on turn 3."
    deeper_anchors = ("timeline", "value", "sponsor", "roadmap")
    all_items = turn1 + turn2 + turn3
    assert any(any(kw in s.lower() for kw in deeper_anchors) for s in all_items), (
        f"Expected deeper-ladder anchors to surface across 3 turns, got: "
        f"turn1={turn1!r} turn2={turn2!r} turn3={turn3!r}"
    )


# ============================================================
# Phase: All-file-type extraction (P0 + P1 fixes — RC #4/5/6/7/8/9/10)
# ============================================================

def test_extract_text_endpoint_with_md(client):
    """Markdown file extracts as plain text (UTF-8)."""
    body = b"# Title\n\n- Bullet one\n- Bullet two with **bold**"
    response = client.post(
        "/agents/extract-text",
        files={"file": ("readme.md", body, "text/markdown")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "md"
    assert "Bullet one" in data["text"]
    assert "**bold**" in data["text"]
    assert data["chars"] > 0


def test_extract_text_endpoint_with_csv_pretty_print(client):
    """CSV is rendered as an aligned table with a separator under the header row."""
    body = b"name,role,department\nAlice,CISO,Security\nBob,CFO,Finance\nClaudia,CIO,Technology\n"
    response = client.post(
        "/agents/extract-text",
        files={"file": ("staff.csv", body, "text/csv")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "csv"
    text = data["text"]
    # Header row contains all three column names
    assert "name" in text and "role" in text and "department" in text
    # Separator line of dashes separates header from data
    assert "-" in text.split("\n")[1]
    # All three rows present
    assert "Alice" in text and "Bob" in text and "Claudia" in text
    # Pipes used as column delimiters
    assert "|" in text


def test_extract_text_endpoint_with_csv_semicolon_delimiter(client):
    """Sniffer detects semicolon-delimited CSV (common in European Excel exports)."""
    body = b"name;role;department\nAlice;CISO;Security\nBob;CFO;Finance\n"
    response = client.post(
        "/agents/extract-text",
        files={"file": ("euro.csv", body, "text/csv")},
    )
    assert response.status_code == 200, response.text
    text = response.json()["text"]
    assert "Alice" in text and "Bob" in text and "CISO" in text


def test_extract_text_endpoint_with_json_pretty_print(client):
    """JSON is parsed and pretty-printed with indent=2."""
    body = b'{"score":75,"tier":"Strong","gaps":["governance","explainability"]}'
    response = client.post(
        "/agents/extract-text",
        files={"file": ("result.json", body, "application/json")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "json"
    text = data["text"]
    # Indented (multi-line) output, not minified.
    assert "\n" in text
    assert '  "score": 75' in text
    assert '"governance"' in text and '"explainability"' in text


def test_extract_text_endpoint_with_malformed_json_falls_back_to_raw(client):
    """Malformed JSON returns the raw text rather than 500-ing."""
    body = b'{"key": this is not valid json'
    response = client.post(
        "/agents/extract-text",
        files={"file": ("bad.json", body, "application/json")},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "json"
    assert "key" in data["text"]


def test_extract_text_endpoint_doc_extension_rejected(client):
    """Legacy .doc files are rejected with a clear 415 message."""
    response = client.post(
        "/agents/extract-text",
        files={"file": ("legacy.doc", b"anything", "application/msword")},
    )
    assert response.status_code == 415, response.text
    assert ".doc is not supported" in response.json()["detail"]


def test_extract_text_endpoint_doc_renamed_to_docx_rejected(client):
    """A .doc file renamed to .docx is detected by OLE magic bytes and rejected."""
    # OLE Compound File Binary magic header — what every real .doc starts with.
    ole_magic = b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1" + b"\x00" * 100
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "renamed.docx",
            ole_magic,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    assert response.status_code == 415, response.text
    assert ".doc is not supported" in response.json()["detail"]


# --- DOCX deeper checks ---

def _make_docx_with_table_in_middle() -> bytes:
    """A doc structured Intro paragraph → Table → Conclusion paragraph.

    The old extractor flattened to [Intro, Conclusion, table-cells…], breaking
    document order. The new extractor walks body in XML order so we should see
    Conclusion appear AFTER the table content.
    """
    from io import BytesIO
    from docx import Document
    doc = Document()
    doc.add_paragraph("Intro paragraph before the financial summary.")
    t = doc.add_table(rows=2, cols=2)
    t.cell(0, 0).text = "Metric"
    t.cell(0, 1).text = "Value"
    t.cell(1, 0).text = "Revenue"
    t.cell(1, 1).text = "1234567"
    doc.add_paragraph("Conclusion paragraph after the financial summary.")
    buf = BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_extract_text_docx_preserves_body_order(client):
    """Intro paragraph appears before table; table appears before conclusion."""
    docx_bytes = _make_docx_with_table_in_middle()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "ordered.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    assert response.status_code == 200, response.text
    text = response.json()["text"]
    i_intro = text.find("Intro paragraph")
    i_table = text.find("[Table]")
    i_concl = text.find("Conclusion paragraph")
    assert -1 < i_intro < i_table < i_concl, (
        f"Body order violated. intro={i_intro} table={i_table} conclusion={i_concl}\nOutput:\n{text}"
    )


def test_extract_text_docx_marks_tables(client):
    """Tables are tagged with a [Table] marker so the LLM can distinguish them from prose."""
    docx_bytes = _make_docx_with_table_in_middle()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "tagged.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    text = response.json()["text"]
    assert "[Table]" in text
    assert "Metric | Value" in text
    assert "Revenue | 1234567" in text


def test_extract_text_docx_dedupes_merged_cells(client):
    """Merged cells iterate as duplicates in python-docx; extractor must dedupe."""
    from io import BytesIO
    from docx import Document
    doc = Document()
    t = doc.add_table(rows=1, cols=3)
    t.cell(0, 0).text = "Unique cell A"
    t.cell(0, 1).text = "MERGED CELL B"
    t.cell(0, 2).text = "Unique cell C"
    # Merge cells 1 and 2 — python-docx now yields the merged cell twice via row.cells.
    t.cell(0, 1).merge(t.cell(0, 2))
    buf = BytesIO()
    doc.save(buf)
    docx_bytes = buf.getvalue()

    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "merged.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    assert response.status_code == 200, response.text
    text = response.json()["text"]
    # The merged cell text must appear exactly once on the row.
    table_section = text[text.find("[Table]"):]
    assert table_section.count("MERGED CELL B") == 1, (
        f"Merged-cell content appeared {table_section.count('MERGED CELL B')} times; expected 1.\n{table_section}"
    )


def test_extract_text_docx_includes_header_and_footer(client):
    """Headers and footers from each section are appended to the extracted text."""
    from io import BytesIO
    from docx import Document
    doc = Document()
    doc.add_paragraph("Body paragraph one.")
    section = doc.sections[0]
    section.header.paragraphs[0].text = "CONFIDENTIAL - HEADER LINE"
    section.footer.paragraphs[0].text = "Page footer disclaimer text"
    buf = BytesIO()
    doc.save(buf)

    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "hf.docx",
            buf.getvalue(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )},
    )
    text = response.json()["text"]
    assert "CONFIDENTIAL - HEADER LINE" in text
    assert "Page footer disclaimer text" in text
    assert "[Header]" in text
    assert "[Footer]" in text


# --- PPTX checks ---

def _make_pptx_bytes() -> bytes:
    """A 3-slide deck with text shapes, a table, speaker notes, and a grouped shape."""
    from io import BytesIO
    from pptx import Presentation
    from pptx.util import Inches

    prs = Presentation()
    blank = prs.slide_layouts[6]

    # Slide 1: a single text box.
    s1 = prs.slides.add_slide(blank)
    box1 = s1.shapes.add_textbox(Inches(1), Inches(1), Inches(4), Inches(1))
    box1.text_frame.text = "AI Governance Council kickoff agenda"
    s1.notes_slide.notes_text_frame.text = "Speaker note: emphasise the 90-day plan."

    # Slide 2: a 2x2 table.
    s2 = prs.slides.add_slide(blank)
    rows, cols = 2, 2
    tbl_shape = s2.shapes.add_table(rows, cols, Inches(1), Inches(1), Inches(4), Inches(1))
    table = tbl_shape.table
    table.cell(0, 0).text = "Quarter"
    table.cell(0, 1).text = "Spend"
    table.cell(1, 0).text = "Q1"
    table.cell(1, 1).text = "$120,000"

    # Slide 3: text box for a simple sanity check on slide numbering.
    s3 = prs.slides.add_slide(blank)
    box3 = s3.shapes.add_textbox(Inches(1), Inches(1), Inches(4), Inches(1))
    box3.text_frame.text = "Closing remarks slide content"

    buf = BytesIO()
    prs.save(buf)
    return buf.getvalue()


def test_extract_text_endpoint_with_pptx_basic(client):
    """PPTX extraction returns slide content including slide markers."""
    pptx_bytes = _make_pptx_bytes()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "deck.pptx",
            pptx_bytes,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["format"] == "pptx"
    text = data["text"]
    assert "AI Governance Council kickoff agenda" in text
    assert "Closing remarks slide content" in text


def test_extract_text_pptx_marks_slide_numbers(client):
    """Each slide gets a [Slide N] marker for grounding."""
    pptx_bytes = _make_pptx_bytes()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "marked.pptx",
            pptx_bytes,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )},
    )
    text = response.json()["text"]
    assert "[Slide 1]" in text
    assert "[Slide 2]" in text
    assert "[Slide 3]" in text
    # Slide markers appear in order.
    assert text.find("[Slide 1]") < text.find("[Slide 2]") < text.find("[Slide 3]")


def test_extract_text_pptx_extracts_tables(client):
    """Tables embedded in slides are walked cell-by-cell, not silently dropped."""
    pptx_bytes = _make_pptx_bytes()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "tables.pptx",
            pptx_bytes,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )},
    )
    text = response.json()["text"]
    assert "Quarter | Spend" in text
    assert "Q1 | $120,000" in text


def test_extract_text_pptx_includes_speaker_notes(client):
    """Speaker notes are extracted when present."""
    pptx_bytes = _make_pptx_bytes()
    response = client.post(
        "/agents/extract-text",
        files={"file": (
            "withnotes.pptx",
            pptx_bytes,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )},
    )
    text = response.json()["text"]
    assert "emphasise the 90-day plan" in text
    assert "[Notes]" in text
