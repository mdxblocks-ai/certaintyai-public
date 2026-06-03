"""LLM-as-Judge Evaluation Suite for Insights and Narrative Agents.

This test module is entirely additive and runs LLM-gated evaluation tests
verifying quality, relevance, and compliance across C-suite roles.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

import pytest

from app.agents.frameworks import resolve_frameworks
from app.agents.gap_analysis import run as run_gap_analysis
from app.agents.insights_agent import generate_insights
from app.agents.llm_client import complete_json
from app.agents.narrative_agent import generate_narrative
from app.agents.score_agent import calculate_scores

logger = logging.getLogger(__name__)

# Skip evaluation tests by default to conserve Vertex AI quota on standard test runs
run_evals_condition = pytest.mark.skipif(
    os.getenv("RUN_EVALS") != "1",
    reason="Skipping live LLM-as-judge evaluations. Set RUN_EVALS=1 to run."
)


def _profile(**overrides) -> dict[str, Any]:
    """Builder so each test only writes the fields that matter to it, matching the score agent tests."""
    base = {
        "company": {
            "company_name": "Eval Client Corp",
            "contact_name": "Jane Tester",
            "email": "eval@certaintyai.com",
            "additional_deliverables": ""
        },
        "role": "cio_cto",
        "objectives": ["Improve operational efficiency", "Enhance decision accuracy", "Mitigate AI risks"],
        "objectives_other": "",
        "painPoints": ["AI hallucinations / inaccurate responses", "Cannot audit or explain AI decisions"],
        "painPoints_other": "",
        "dataState": {
            "location": ["cloud"],
            "format": ["structured"],
            "freshness": ["monthly"],
            "quality": ["clean"],
            "volume": "medium",
        },
        "domains": ["Healthcare & Life Sciences"],
        "domains_other": "",
        "maturity": ["In Production"],
        "ai_use_cases": ["General Chat"],
        "semantic": "3-5_aligned",
        "rag": "pilot_unknown",
        "audit": "partial",
        "oversight": "partial_adhoc",
        "blockers": ["Data Integration / Silos", "Cost / ROI", "Skills Gap"],
        "blockers_other": "",
        "priority": "risk_reduction",
        "custom_frameworks": "ISO 42001, SOC 2",
    }
    base.update(overrides)
    return base


def judge(agent_output: dict[str, Any], context: dict[str, str]) -> dict[str, Any]:
    """Call complete_json to evaluate agent output using standard Vertex AI provider."""
    system_prompt = (
        "You are a strict evaluator of AI-governance report text. "
        "Output JSON only — no prose, no markdown fences. "
        "Keep rationale under 15 words. Numbers first."
    )
    user_message = (
        f"Context:\n"
        f"- Target Industry Sector: {context.get('industry')}\n"
        f"- Target C-Suite Role: {context.get('role')}\n\n"
        f"Agent Output (Insights & Narrative):\n"
        f"{json.dumps(agent_output, indent=2)}\n\n"
        "Evaluate the above agent output against standard C-suite AI-Readiness guidelines.\n"
        "Score the text on a scale of 1 to 5 for each of these five categories:\n"
        "1. relevance_to_role: Matches C-suite executive language, tone, and strategic concerns (ROI, risk, cost, speed).\n"
        "2. framework_grounding: Mentions and applies frameworks correctly (NIST AI RMF, EU AI Act, ISO 42001, HIPAA, or sector rules).\n"
        "3. explainability: Rationale for scores, gaps, and recommendations are easy to follow and professional.\n"
        "4. no_pii_leakage: No API keys, credentials, developer comments, or mock test values are leaked.\n"
        "5. structural_validity: All required fields and keys are present and contain valid content.\n\n"
        "You MUST return a strict JSON object with this exact shape:\n"
        "{\n"
        "  \"scores\": {\n"
        "    \"relevance_to_role\": <1-5>,\n"
        "    \"framework_grounding\": <1-5>,\n"
        "    \"explainability\": <1-5>,\n"
        "    \"no_pii_leakage\": <1-5>,\n"
        "    \"structural_validity\": <1-5>\n"
        "  },\n"
        "  \"overall\": <1-5 average/summary score>,\n"
        "  \"pass\": <bool, true if all scores are >= 4, else false>,\n"
        "  \"rationale\": \"<max 15 words>\"\n"
        "}"
    )

    raw = complete_json(system_prompt=system_prompt, user_message=user_message, max_tokens=4000)

    # Clean raw string defensively by stripping any markdown code fences
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        # Regex-based extraction fallback for resilient parsing of truncated JSON
        scores_keys = [
            "relevance_to_role",
            "framework_grounding",
            "explainability",
            "no_pii_leakage",
            "structural_validity",
        ]
        
        def regex_extract_field(text: str, field_name: str) -> str | None:
            pattern = rf'["\']{field_name}["\']\s*:\s*([^,\}}\n\]]+)'
            match = re.search(pattern, text)
            if match:
                val = match.group(1).strip()
                val = re.sub(r'^["\']|["\']$', '', val)
                val = re.sub(r'//.*', '', val)
                return val.strip()
            return None

        extracted_scores = {}
        for key in scores_keys:
            val_str = regex_extract_field(cleaned, key)
            if val_str:
                digit_match = re.search(r'\d+', val_str)
                if digit_match:
                    extracted_scores[key] = int(digit_match.group(0))

        overall_str = regex_extract_field(cleaned, "overall")
        overall = None
        if overall_str:
            digit_match = re.search(r'\d+', overall_str)
            if digit_match:
                overall = int(digit_match.group(0))

        pass_str = regex_extract_field(cleaned, "pass")
        pass_val = None
        if pass_str:
            if "true" in pass_str.lower():
                pass_val = True
            elif "false" in pass_str.lower():
                pass_val = False

        # If all scores, overall and pass are recovered, build clean dict defaulting rationale to "(truncated)"
        if len(extracted_scores) == len(scores_keys) and overall is not None and pass_val is not None:
            return {
                "scores": extracted_scores,
                "overall": overall,
                "pass": pass_val,
                "rationale": "(truncated)"
            }

        raise AssertionError(
            f"Judge response could not be parsed as JSON, and regex recovery failed.\n"
            f"Raw response:\n{raw}\n"
            f"Extracted details: scores={extracted_scores}, overall={overall}, pass={pass_val}\n"
            f"Error details: {exc}"
        ) from exc


def _run_agent_pipeline(answers: dict[str, Any]) -> dict[str, Any]:
    """Run full agent orchestration pipeline just like the real orchestrator does.

    Wired using:
    - app.agents.score_agent.calculate_scores
    - app.agents.frameworks.resolve_frameworks
    - app.agents.gap_analysis.run
    - app.agents.insights_agent.generate_insights
    - app.agents.narrative_agent.generate_narrative
    """
    scores = calculate_scores(answers)

    # Resolve frameworks exactly how the orchestrator does
    fw_list = resolve_frameworks(
        domains=answers.get("domains", []) or [],
        domains_other=answers.get("domains_other", ""),
        custom_frameworks=answers.get("custom_frameworks", ""),
    )

    # Resolve gaps exactly how the orchestrator does
    gaps = run_gap_analysis(answers)

    # Generate strategic C-suite insights
    insights = generate_insights(
        answers=answers,
        scores=scores,
        frameworks=fw_list,
        gap_analysis=gaps,
        memories=None
    )

    # Generate executive narrative prose
    narrative = generate_narrative(
        answers=answers,
        scores=scores,
        frameworks=fw_list,
        gap_analysis=gaps,
        insights=insights
    )

    return {
        "scores": scores,
        "frameworks": fw_list,
        "gap_analysis": gaps,
        "insights": insights,
        "narrative": narrative
    }


# =====================================================================
# Evaluation Cases
# =====================================================================

@pytest.mark.eval
@run_evals_condition
def test_eval_healthcare_ciso():
    """Case 1: Healthcare Industry, CISO Role."""
    answers = _profile(
        domains=["Healthcare & Life Sciences"],
        role="ciso",
        priority="risk_reduction",
        custom_frameworks="HIPAA Security Rule, HITRUST"
    )
    outputs = _run_agent_pipeline(answers)
    
    # Combined outputs to judge
    agent_output = {
        "insights": outputs["insights"],
        "narrative": outputs["narrative"]
    }
    context = {"industry": "Healthcare", "role": "CISO"}

    # Run the LLM Judge
    result = judge(agent_output, context)
    
    assert result["pass"] is True, f"Judge failed Healthcare CISO eval. Rationale: {result.get('rationale')}"
    assert result["overall"] >= 4, f"Judge score too low ({result.get('overall')}). Rationale: {result.get('rationale')}"


@pytest.mark.eval
@run_evals_condition
def test_eval_banking_cfo():
    """Case 2: Banking & Financial Services, CFO Role."""
    answers = _profile(
        domains=["Banking & Financial Services (BFSI)"],
        role="cfo",
        priority="cost_control",
        custom_frameworks="SOX Section 404, SOC 2",
        finops={
            "monthly_spend": 25000.0,
            "primary_provider": "openai_ultra",
            "gpu_constrained": True,
            "dev_ai_ratio": 0.3
        }
    )
    outputs = _run_agent_pipeline(answers)
    
    agent_output = {
        "insights": outputs["insights"],
        "narrative": outputs["narrative"]
    }
    context = {"industry": "Banking & Finance", "role": "CFO"}

    result = judge(agent_output, context)
    
    assert result["pass"] is True, f"Judge failed Banking CFO eval. Rationale: {result.get('rationale')}"
    assert result["overall"] >= 4, f"Judge score too low ({result.get('overall')}). Rationale: {result.get('rationale')}"


@pytest.mark.eval
@run_evals_condition
def test_eval_government_director():
    """Case 3: Government Sector, Director Role."""
    answers = _profile(
        domains=["Government & Public Sector"],
        role="director",
        priority="standardization",
        custom_frameworks="NIST SP 800-53, FedRAMP"
    )
    outputs = _run_agent_pipeline(answers)
    
    agent_output = {
        "insights": outputs["insights"],
        "narrative": outputs["narrative"]
    }
    context = {"industry": "Government & Public Sector", "role": "Director"}

    result = judge(agent_output, context)
    
    assert result["pass"] is True, f"Judge failed Government Director eval. Rationale: {result.get('rationale')}"
    assert result["overall"] >= 4, f"Judge score too low ({result.get('overall')}). Rationale: {result.get('rationale')}"
