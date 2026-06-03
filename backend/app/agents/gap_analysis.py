"""Deterministic gap analysis: strengths, gaps, and the 5 always-on
prioritized recommendations with week ranges.

Lives outside the LLM path so the report's structural conclusions are
defensible numbers and not hallucinations. The InsightsGenerationAgent
(LLM) then narrates around these structural findings.
"""
from __future__ import annotations

import re

from typing import Any, TypedDict


class Recommendation(TypedDict):
    order: int
    week_range: str
    action: str
    rationale: str


class GapAnalysis(TypedDict):
    strengths: list[str]
    gaps: list[str]
    recommendations: list[Recommendation]


# ---- Industry → human label for strength sentences ----
_INDUSTRY_LABEL = {
    "healthcare":    "Healthcare & Life Sciences",
    "education":     "Education",
    "bfsi":          "BFSI",
    "energy":        "Energy & Utilities",
    "legal":         "Legal & Compliance",
    "engineering":   "Engineering & Manufacturing",
    "itconsulting":  "IT Consulting",
    "cybersecurity": "Cybersecurity",
    "government":    "Government",
}

# Aliases — accept whatever the UI passes.
_LABEL_ALIASES = {
    "healthcare & life sciences": "healthcare",
    "health":                     "healthcare",
    "bfsi":                       "bfsi",
    "banking":                    "bfsi",
    "finance":                    "bfsi",
    "energy & utilities":         "energy",
    "legal & compliance":         "legal",
    "engineering & manufacturing": "engineering",
    "it consulting":              "itconsulting",
    "itconsulting":               "itconsulting",
    "education":                  "education",
    "cybersecurity":              "cybersecurity",
    "government":                 "government",
}


def _strip_label(s: str) -> str:
    return re.sub(r'^[\s\W_]+', '', s).strip().lower()


def _canonical_label(raw: str) -> str | None:
    return _LABEL_ALIASES.get(_strip_label(raw))


# Five always-on recommendations — CertaintyAI-spec, with week ranges.
_RECOMMENDATIONS: list[Recommendation] = [
    {
        "order": 1,
        "week_range": "Week 1–2",
        "action": "Establish a formal AI governance committee",
        "rationale": (
            "Make AI approvals and risk reviews predictable. Pulls together CIO/CDO/"
            "CRO/CISO so model rollouts stop being one-off email threads."
        ),
    },
    {
        "order": 2,
        "week_range": "Week 2–4",
        "action": "Deploy Enterprise Data Standardization to Eliminate Duplicate Reporting",
        "rationale": (
            "One shared business vocabulary across source systems. Every downstream "
            "AI use-case stops re-litigating what 'Client' or 'Patient' means."
        ),
    },
    {
        "order": 3,
        "week_range": "Week 3–5",
        "action": "Implement Audit Automation & Compliance Reporting",
        "rationale": (
            "Auditable answer trails (query → ontology → source rows → controls). "
            "Required by HIPAA, GDPR, EU AI Act, and SOX; trivial to forward to auditors."
        ),
    },
    {
        "order": 4,
        "week_range": "Week 4–6",
        "action": "Roll out AI Risk Controls and audit logging across workflows",
        "rationale": (
            "Confidence + provenance per answer turns 'AI said so' into 'AI said so, "
            "here's the citation chain' — the single biggest unlock for production scale."
        ),
    },
    {
        "order": 5,
        "week_range": "Week 6–8",
        "action": "Establish business-outcome-driven KPIs for every AI use-case",
        "rationale": (
            "Gartner: only 49% of orgs run AI against business-outcome metrics. "
            "Tie each model to a $ or hours-saved KPI before the next funding cycle."
        ),
    },
]


def _strengths(answers: dict[str, Any]) -> list[str]:
    """Always at least one. Always include leadership commitment. Add a
    domain-expertise line for each selected industry. Add a production-AI
    line if maturity includes In Production or Scaling."""
    out = ["Leadership commitment to AI adoption demonstrated by initiating this assessment."]

    for raw in answers.get("domains", []) or []:
        canon = _canonical_label(raw)
        label = _INDUSTRY_LABEL.get(canon, raw)
        out.append(f"{label} domain expertise and regulatory familiarity.")

    maturity = [m.strip().lower() for m in (answers.get("maturity") or [])]
    if any("production" in m or "scaling" in m for m in maturity):
        out.append("AI already in production with measurable impact — strong base to scale from.")

    return out


def _gaps(answers: dict[str, Any]) -> list[str]:
    """Conditional — fire each gap only when the corresponding answer is
    below the 'best-case' threshold."""
    out: list[str] = []

    semantic = answers.get("semantic")
    if semantic and semantic != "1-2_same":
        out.append(
            "Semantic fragmentation across systems — your most critical entity is "
            "defined inconsistently, which caps any AI's ability to reason across silos."
        )

    rag = answers.get("rag")
    if rag and rag != "prod_above_85":
        out.append(
            "AI accuracy below the 95% threshold regulated industries expect — "
            "vector-only RAG ceilings without an ontology layer."
        )

    audit = answers.get("audit")
    if audit and audit != "yes":
        out.append(
            "Cannot produce a complete provenance trail for AI-generated answers — "
            "explicit gap against EU AI Act Art. 13 and HIPAA / SOX explainability."
        )

    oversight = answers.get("oversight")
    if oversight and oversight != "formal_committee":
        out.append(
            "Formal AI governance workflows needed — approvals and risk reviews "
            "are ad-hoc; governance frameworks and risk exposure audits are partially implemented."
        )

    quality = (answers.get("dataState", {}) or {}).get("quality", []) or []
    if "messy" in quality or "very_messy" in quality:
        out.append(
            "Data quality issues (duplicates, missing values) — the largest "
            "single drag on model performance and the cheapest to remediate first."
        )

    return out


def run(answers: dict[str, Any]) -> GapAnalysis:
    """Return strengths + gaps + the 5 always-on recommendations."""
    return {
        "strengths": _strengths(answers),
        "gaps": _gaps(answers),
        "recommendations": list(_RECOMMENDATIONS),
    }
