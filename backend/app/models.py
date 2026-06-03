"""User and Assessment ORM models (Phase 1.5 — anon_token + nullable user_id)."""
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
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

