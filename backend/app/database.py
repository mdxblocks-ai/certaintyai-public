"""SQLAlchemy engine, session factory, and FastAPI DB dependency."""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


# Resolve sqlite:///./data/certaintyai.db relative to the backend/ dir
# so the file lands in backend/data/ regardless of where uvicorn is launched.
_db_url = settings.database_url
if _db_url.startswith("sqlite:///./"):
    rel = _db_url[len("sqlite:///./"):]
    abs_path = (Path(__file__).resolve().parent.parent / rel).resolve()
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    _db_url = f"sqlite:///{abs_path}"

_connect_args = {"check_same_thread": False} if _db_url.startswith("sqlite") else {}

engine = create_engine(_db_url, connect_args=_connect_args, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


def get_db():
    """FastAPI dependency that yields a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
