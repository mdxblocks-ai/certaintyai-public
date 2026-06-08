import os
import sys
import warnings

# Suppress noisy SequentialAgent deprecation, experimental, and cryptography warnings (Task D)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)
try:
    from google.adk.utils.experimental import ADKExperimentalWarning
    warnings.filterwarnings("ignore", category=ADKExperimentalWarning)
except Exception:
    pass
warnings.filterwarnings("ignore", message=".*cryptography.*")

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("a2a_producer")

from app.database import _db_url
# Print SQLite DB URL at startup (Constraint 3 & Gate 5)
print(f"DATABASE URL: {_db_url}")

# Standard env-var Vertex wiring (Approved change 3)
from app.config import settings
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "true"
if settings.gcp_project_id:
    os.environ["GOOGLE_CLOUD_PROJECT"] = settings.gcp_project_id
if settings.gcp_location:
    os.environ["GOOGLE_CLOUD_LOCATION"] = settings.gcp_location

from google.adk.models import Gemini
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from app.agents.adk_pipeline import ProducerInsightsAgent, get_insights_instruction

# Instantiate the insights agent
gemini_model = Gemini(model=settings.vertex_model or "gemini-2.0-flash")
from pathlib import Path
insights_agent = ProducerInsightsAgent(
    name="insights",
    description="LLM-based strategic insights generator",
    model=gemini_model,
    instruction="Generate strategic, role-aware AI-readiness insights from assessment scores, frameworks, and gap analysis.",
    output_key="insights"
)
insights_agent._adk_origin_app_name = "insights"
insights_agent._adk_origin_path = Path(__file__).resolve().parent

# Produce ASGI Starlette application
app = to_a2a(
    agent=insights_agent,
    host="localhost",
    port=8001,
    protocol="http"
)

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting A2A Producer on port 8001...")
    uvicorn.run("run_a2a_producer:app", host="localhost", port=8001, log_level="info")
