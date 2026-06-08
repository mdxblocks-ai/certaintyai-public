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

