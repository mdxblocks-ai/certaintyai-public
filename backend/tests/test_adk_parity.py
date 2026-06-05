import pytest
import os
import inspect
from unittest.mock import patch
import sys
import subprocess
import asyncio

from app.agents import score_agent
from app.agents.orchestrator import generate_readiness_report
from app.agents.adk_pipeline import run_adk_pipeline

def _profile(**overrides):
    base = {
        "semantic": "3-5_aligned",
        "rag": "pilot_unknown",
        "audit": "partial",
        "oversight": "partial_adhoc",
        "dataState": {
            "location": ["cloud"],
            "format": ["structured"],
            "freshness": ["real_time"],
            "quality": ["clean"],
            "volume": "medium",
        },
        "role": "CFO",
        "domains": ["🏥 Healthcare & Life Sciences"]
    }
    base.update(overrides)
    return base

def test_parity_legacy_pipeline():
    async def run_test():
        # Setup test environment variables
        os.environ["USE_ADK_PIPELINE"] = "true"
        from app.database import _db_url
        print("DATABASE URL IN TEST:", _db_url)
        print("SETTINGS DATABASE URL IN TEST:", score_agent.settings.database_url if hasattr(score_agent, 'settings') else "N/A")

        answers = _profile()
        payload_dict = {
            "payload_type": "legacy",
            "answers": answers,
            "email": "demo@mdxblocks.com"
        }

        # Spy on score_agent.calculate_scores and score_agent.calculate_dynamic_scores
        llm_calls_in_stack = []
        
        orig_calculate_scores = score_agent.calculate_scores
        def spy_calculate_scores(*args, **kwargs):
            stack = inspect.stack()
            for frame in stack:
                # Check if any LLM or model invocation paths are present in the caller stack
                if "llm_agent" in frame.filename or "llm_client" in frame.filename or "google/adk/flows" in frame.filename.replace("\\", "/"):
                    llm_calls_in_stack.append(("calculate_scores", frame.filename, frame.function))
            return orig_calculate_scores(*args, **kwargs)

        orig_calculate_dynamic_scores = score_agent.calculate_dynamic_scores
        def spy_calculate_dynamic_scores(*args, **kwargs):
            stack = inspect.stack()
            for frame in stack:
                if "llm_agent" in frame.filename or "llm_client" in frame.filename or "google/adk/flows" in frame.filename.replace("\\", "/"):
                    llm_calls_in_stack.append(("calculate_dynamic_scores", frame.filename, frame.function))
            return orig_calculate_dynamic_scores(*args, **kwargs)

        # Execute both pipelines with the spy active
        with patch.object(score_agent, "calculate_scores", side_effect=spy_calculate_scores), \
             patch.object(score_agent, "calculate_dynamic_scores", side_effect=spy_calculate_dynamic_scores):
            
            # Legacy pipeline
            legacy_report = generate_readiness_report(answers)
            
            # ADK pipeline
            adk_report = await run_adk_pipeline(
                payload_dict=payload_dict,
                user_id="user123",
                session_id="session123"
            )

        # 1. Parity assertion: assert deep-equality ONLY on deterministic outputs (scores + fields derived from scores)
        # Approved change 1: Do NOT assert narrative/insights equality (since they are LLM-based and stochastic)
        assert legacy_report["scores"] == adk_report["scores"]
        assert legacy_report["frameworks"] == adk_report["frameworks"]
        assert legacy_report["frameworks_by_category"] == adk_report["frameworks_by_category"]
        assert legacy_report["gap_analysis"] == adk_report["gap_analysis"]
        assert legacy_report["peer_benchmark"] == adk_report["peer_benchmark"]
        assert legacy_report["value_roadmap"] == adk_report["value_roadmap"]
        assert legacy_report["value_roadmap_totals"] == adk_report["value_roadmap_totals"]
        assert legacy_report["evidence_pack"] == adk_report["evidence_pack"]
        assert legacy_report["regulator_paragraph"] == adk_report["regulator_paragraph"]

        # 2. Firewall assertion: programmatically prove that calculate_scores / calculate_dynamic_scores
        # was never invoked in any LLM/agent path (Approved change 5)
        assert len(llm_calls_in_stack) == 0, f"LLM/Agent path leaked into deterministic scoring! Leaks: {llm_calls_in_stack}"

    asyncio.run(run_test())

def test_test_score_agent_unchanged():
    # Programmatic verification that test_score_agent.py is completely untouched (Approved change 5)
    cmd = ["git", "diff", "--exit-code", "tests/test_score_agent.py"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"test_score_agent.py has been modified: {res.stdout}"
