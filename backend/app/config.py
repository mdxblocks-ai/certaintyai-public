"""Application settings loaded from environment variables."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed view of the backend/.env file (with sensible defaults)."""

    # ----- Auth / JWT -----
    jwt_secret: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24

    # ----- Database -----
    database_url: str = "sqlite:///./data/certaintyai.db"

    # ----- LLM provider abstraction -----
    # Default stays on-spec per CONTEXT.md §11 (claude-sonnet-4-6 via the
    # Anthropic SDK). Local dev .env can override `llm_provider` to "openai".
    llm_provider: str = "anthropic"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-pro"

    # ----- Vertex AI (Track 3 production path) -----
    # Used by `_complete_vertex` in llm_client.py when LLM_PROVIDER=vertex.
    # Auth resolves via ADC (gcloud auth application-default login for local dev;
    # attached service account on Cloud Run / GKE). No API key needed here.
    gcp_project_id: str = ""
    gcp_location: str = "us-central1"
    vertex_model: str = "gemini-2.0-flash"

    # ----- Phase 2 Active Memory -----
    enable_memory: bool = True
    memory_threshold: float = 0.70
    gemini_embedding_model: str = "models/text-embedding-004"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
