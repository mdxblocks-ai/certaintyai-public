"""ReadinessReportAgent (Phase 2) — score → frameworks → gaps → memory → C-suite → LLM."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session

from . import csuite_features, frameworks, gap_analysis, embedding_service
from .insights_agent import generate_insights
from .narrative_agent import generate_narrative
from .score_agent import calculate_scores

logger = logging.getLogger(__name__)


def generate_readiness_report(answers: dict[str, Any], db: Session | None = None) -> dict[str, Any]:
    logger.info("Orchestrator: scoring…")
    scores = calculate_scores(answers)

    logger.info("Orchestrator: frameworks (total=%s, tier=%s)",
                scores.get("total_score"), scores.get("maturity_tier"))
    fw_list = frameworks.resolve_frameworks(
        domains=answers.get("domains", []) or [],
        domains_other=answers.get("domains_other", ""),
        custom_frameworks=answers.get("custom_frameworks", ""),
    )
    fw_by_cat = frameworks.group_by_category(fw_list)

    logger.info("Orchestrator: gap analysis…")
    gaps = gap_analysis.run(answers)

    logger.info("Orchestrator: semantic memory lookup…")
    memories = []
    try:
        sig = embedding_service.generate_profile_signature(answers)
        vector = embedding_service.create_vector_embedding(sig)
        if db is not None:
            memories = embedding_service.get_similar_memories(db, vector)
            logger.info("Orchestrator: retrieved %s semantically similar historical memories", len(memories))
    except Exception as exc:
        logger.warning("Failed to retrieve semantic memories: %s", exc)

    logger.info("Orchestrator: C-suite features…")
    benchmark = csuite_features.peer_benchmark(
        your_score=scores["total_score"],
        domains=answers.get("domains", []) or [],
    )
    roadmap = csuite_features.value_roadmap(answers)
    roadmap_totals = csuite_features.roadmap_totals(roadmap)
    evidence = csuite_features.evidence_pack_preview(answers)
    regulator = csuite_features.regulator_paragraph(answers.get("domains", []) or [])

    logger.info("Orchestrator: insights (LLM with memory)…")
    insights = generate_insights(answers, scores, fw_list, gaps, memories)

    logger.info("Orchestrator: narrative (LLM)…")
    narrative = generate_narrative(answers, scores, fw_list, gaps, insights)

    return {
        "answers": answers,
        "company": answers.get("company") or {},
        "scores": scores,
        "frameworks": fw_list,
        "frameworks_by_category": fw_by_cat,
        "gap_analysis": gaps,
        "peer_benchmark": benchmark,
        "value_roadmap": roadmap,
        "value_roadmap_totals": roadmap_totals,
        "evidence_pack": evidence,
        "regulator_paragraph": regulator,
        "insights": insights,
        "narrative": narrative,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }

