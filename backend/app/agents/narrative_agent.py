"""NarrativeAgent — Claude/OpenAI call producing the report's four prose sections.

Phase 1.5.1 — fallback shortened to 80-120 words/section to match the new
CertaintyAI-style template.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from .insights_agent import _extract_first_json_object
from .llm_client import LLMError, complete_json
from .prompts import NARRATIVE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

MAX_TOKENS = 1800


def _industry_label(answers: dict[str, Any]) -> str:
    domains = answers.get("domains") or []
    return (domains[0].title() if domains else "your sector")


def _fallback(answers: dict[str, Any], scores: dict[str, Any],
              gap_analysis: dict[str, Any], insights: dict[str, Any]) -> dict[str, Any]:
    industry = _industry_label(answers)
    tier = scores.get("maturity_tier", "Moderate / Developing")
    total = scores.get("total_score", 50)
    subs = scores.get("sub_scores", {}) or {}
    nist = scores.get("nist_rmf", {}) or {}
    return {
        "current_state_summary": (
            f"The organization sits in the {tier} band with a readiness score "
            f"of {total}/100. In {industry}, this is the tier where AI ambition "
            "outpaces operational backbone. Leadership is engaged and pilots "
            "exist, but the data and governance layer has not yet been treated "
            "as architecture — so each new use-case re-litigates ownership, "
            "definitions, and access."
        ),
        "data_maturity_review": (
            f"On the Gartner AI-Ready Data 4-Enablers framework, the data "
            f"sub-score is {subs.get('data', 50)} and the semantic sub-score "
            f"is {subs.get('semantic', 50)}. Sources are uneven, structure varies, "
            "and critical entities are defined differently across systems. Even "
            "technically correct AI outputs land in workflows that cannot act on "
            "them at scale. The fix is shared Enterprise Data Standardization and compliance reporting."
        ),
        "findings_narrative": (
            f"{insights.get('blockers_diagnosis', 'Blockers are structural.')} "
            f"NIST AI RMF GOVERN sits at {nist.get('govern', 50)} and MEASURE "
            f"at {nist.get('measure', 30)} — the two functions most directly "
            "tied to audit-readiness. The five recommendations below sequence "
            "the next 90 days: governance committee, enterprise data standardization, "
            "compliance audit reporting, confidence scoring, and business-outcome KPIs."
        ),
        "executive_summary": (
            f"AI Readiness: {tier} ({total}/100). The single biggest 90-day "
            "lever is not model selection — it is governance, enterprise data "
            "standardization, and compliance audit reporting by default. Done "
            "well, the organisation moves out of pilot purgatory and into the "
            "band where AI compounds."
        ),
    }


def generate_narrative(answers: dict[str, Any], scores: dict[str, Any],
                        frameworks: list[dict[str, Any]], gap_analysis: dict[str, Any],
                        insights: dict[str, Any]) -> dict[str, Any]:
    user_message = (
        f"answers:\n{json.dumps(answers, indent=2)}\n\n"
        f"scores:\n{json.dumps(scores, indent=2)}\n\n"
        f"frameworks:\n{json.dumps([f['name'] for f in frameworks], indent=2)}\n\n"
        f"gap_analysis:\n{json.dumps(gap_analysis, indent=2)}\n\n"
        f"insights:\n{json.dumps(insights, indent=2)}"
    )
    role = answers.get("role", "Business Leader")
    role_lenses = {
        "CFO": "Focus heavily on dollars, ROI, payback, budget exposure, and cost of inaction. Use professional financial/economic terminology and frame all findings through their strategic bottom-line impact.",
        "Business Leader": "Focus heavily on outcomes, competitive position, and time-to-value. Use business/operational terminology and frame all findings through strategic output and organizational advantage.",
        "CIO": "Focus heavily on architecture, systems integration, technical debt, and delivery feasibility. Use professional engineering/systems terminology.",
        "CTO": "Focus heavily on architecture, systems integration, technical debt, and delivery feasibility. Use professional engineering/systems terminology.",
        "CDO": "Focus heavily on data quality, governance, lineage, and semantic consistency. Use data governance/lineage terminology.",
        "Compliance Officer": "Focus heavily on regulatory exposure, audit-readiness, and compliance framework gaps. Use governance, risk, and compliance (GRC) terminology.",
        "Head of AI": "Focus heavily on model performance, capability roadmap, scaling, and operationalization. Use machine learning/engineering terminology.",
        "Security Director": "Focus heavily on threat exposure, risk controls, human oversight, and data breach risk. Use security/control terminology."
    }
    lens = role_lenses.get(role, role_lenses["Business Leader"])
    role_instruction = (
        f"\n\nCRITICAL READER LENS: The active reader of this report is a {role}. "
        f"Output plain text only — no Markdown, no asterisks, no ** for bold. "
        f"Frame all generated paragraphs and findings strictly through the {role} lens: {lens} "
        f"Express the same underlying data and deterministic findings, but entirely in their "
        f"specialized language and vocabulary. Do NOT fabricate any numbers."
    )
    
    try:
        raw = complete_json(
            system_prompt=NARRATIVE_SYSTEM_PROMPT + role_instruction,
            user_message=user_message,
            max_tokens=MAX_TOKENS,
        )
    except LLMError as exc:
        logger.warning("NarrativeAgent fell back to default content: %s", exc)
        return _fallback(answers, scores, gap_analysis, insights)
    try:
        return json.loads(_extract_first_json_object(raw))
    except (ValueError, json.JSONDecodeError) as exc:
        logger.warning(
            "NarrativeAgent could not parse model JSON (%s); using fallback. "
            "Raw response length=%d. Prefix: %s",
            exc, len(raw), raw[:20],
        )
        return _fallback(answers, scores, gap_analysis, insights)
