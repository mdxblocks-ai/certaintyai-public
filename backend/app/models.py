"""User and Assessment ORM models (Phase 1.5 — anon_token + nullable user_id)."""
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _new_token() -> str:
    return uuid4().hex


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    role: Mapped[str] = mapped_column(String(64), nullable=False, default="user")
    first_assessment_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)

    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment", back_populates="user", cascade="all, delete-orphan",
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True, index=True,
    )
    anon_token: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False, default=_new_token,
    )
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    answers: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    report_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)

    user: Mapped["User | None"] = relationship("User", back_populates="assessments")


class AssessmentMemory(Base):
    __tablename__ = "assessment_memories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    signature_text: Mapped[str] = mapped_column(Text, nullable=False)
    # Dense vector coordinates serialized as a portable JSON-string float array
    embedding_json: Mapped[str] = mapped_column(Text, nullable=False)


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    instructions: Mapped[str] = mapped_column(Text, nullable=False, default="")
    icon: Mapped[str] = mapped_column(Text, nullable=False, default="ti-robot")
    role: Mapped[str] = mapped_column(String(64), nullable=False, default="ciso")
    model: Mapped[str] = mapped_column(String(128), nullable=False, default="Gemini 2.5 · Vertex AI")
    temperature: Mapped[float] = mapped_column(Float, nullable=False, default=0.3)
    max_steps: Mapped[int] = mapped_column(Integer, nullable=False, default=25)
    tools: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    owner: Mapped["User"] = relationship("User")
    documents: Mapped[list["AgentDocument"]] = relationship("AgentDocument", back_populates="agent", cascade="all, delete-orphan")
    runs: Mapped[list["AgentRun"]] = relationship("AgentRun", back_populates="agent", cascade="all, delete-orphan")

    @property
    def run_count(self) -> int:
        return len(self.runs)


class AgentDocument(Base):
    __tablename__ = "agent_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)  # 'local', 'sharepoint', 'portal'
    source_ref: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="indexed")  # 'indexed', 'linked/queued'
    indexed_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)

    agent: Mapped["Agent"] = relationship("Agent", back_populates="documents")
    chunks: Mapped[list["AgentDocumentChunk"]] = relationship("AgentDocumentChunk", back_populates="document", cascade="all, delete-orphan")


class AgentDocumentChunk(Base):
    __tablename__ = "agent_document_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_document_id: Mapped[int] = mapped_column(Integer, ForeignKey("agent_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON-string float array

    document: Mapped["AgentDocument"] = relationship("AgentDocument", back_populates="chunks")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    input: Mapped[str] = mapped_column(Text, nullable=False)
    steps: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)  # [{step: int, type: str, detail: str, tool: str, tokens: int}]
    outcome: Mapped[str] = mapped_column(Text, nullable=False, default="")
    follow_ups: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    retrieved_sources: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="completed")  # 'completed', 'failed'
    started_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)
    finished_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    agent: Mapped["Agent"] = relationship("Agent", back_populates="runs")
    owner: Mapped["User"] = relationship("User")

