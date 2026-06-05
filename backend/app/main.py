"""FastAPI application entrypoint for CertaintyAI."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401 — ensures tables register on Base.metadata
from .database import Base, SessionLocal, engine
from .routers import a2a as a2a_router
from .routers import agent_builder as agent_builder_router
from .routers import auth as auth_router
from .routers import report as report_router
from .routers import survey as survey_router
from .seed import seed_demo_assessment, seed_demo_users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("certaintyai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed demo users on startup."""
    # Securely enable pgvector extension in PostgreSQL
    if engine.url.drivername.startswith("postgresql"):
        try:
            with engine.connect() as conn:
                from sqlalchemy import text
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                logger.info("pgvector extension loaded successfully")
        except Exception as exc:
            logger.warning("Could not create pgvector extension: %s", exc)

    Base.metadata.create_all(bind=engine)

    # Check and add columns if missing dynamically to support zero-config sync
    try:
        with engine.connect() as conn:
            from sqlalchemy import inspect
            inspector = inspect(engine)
            table_names = inspector.get_table_names()
            
            if "users" in table_names:
                columns = [c["name"] for c in inspector.get_columns("users")]
                if "first_assessment_completed" not in columns:
                    logger.info("Adding first_assessment_completed column to users table...")
                    from sqlalchemy import text
                    conn.execute(text("ALTER TABLE users ADD COLUMN first_assessment_completed BOOLEAN NOT NULL DEFAULT FALSE;"))
                    conn.commit()
                    
            if "agents" in table_names:
                columns = [c["name"] for c in inspector.get_columns("agents")]
                if "voice_enabled" not in columns:
                    logger.info("Adding voice_enabled column to agents table...")
                    from sqlalchemy import text
                    conn.execute(text("ALTER TABLE agents ADD COLUMN voice_enabled BOOLEAN NOT NULL DEFAULT TRUE;"))
                    conn.commit()
                    
            if "agent_runs" in table_names:
                columns = [c["name"] for c in inspector.get_columns("agent_runs")]
                if "follow_ups" not in columns:
                    logger.info("Adding follow_ups column to agent_runs table...")
                    from sqlalchemy import text
                    conn.execute(text("ALTER TABLE agent_runs ADD COLUMN follow_ups JSON NOT NULL DEFAULT '[]';"))
                    conn.commit()
                if "retrieved_sources" not in columns:
                    logger.info("Adding retrieved_sources column to agent_runs table...")
                    from sqlalchemy import text
                    conn.execute(text("ALTER TABLE agent_runs ADD COLUMN retrieved_sources JSON NOT NULL DEFAULT '[]';"))
                    conn.commit()
    except Exception as exc:
        logger.warning("Could not add database columns dynamically: %s", exc)

    db = SessionLocal()
    try:
        seed_demo_users(db)
        seed_demo_assessment(db)
    finally:
        db.close()
    logger.info("CertaintyAI startup complete")
    yield


app = FastAPI(title="CertaintyAI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:80",
        "http://localhost",
        # Microsoft Dev Tunnels — allows any subdomain for external testing
        "https://qfbd1vbr-5173.usw3.devtunnels.ms",
       "https://qfbd1vbr-8000.usw3.devtunnels.ms",
        # Cloud Run frontend (production)
        "https://certaintyai-frontend-217783557903.us-central1.run.app",
    ],
    allow_origin_regex=r"https://.*\.devtunnels\.ms",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router)
app.include_router(survey_router.router)
app.include_router(report_router.router)
app.include_router(a2a_router.router)
app.include_router(agent_builder_router.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "certaintyai"}
