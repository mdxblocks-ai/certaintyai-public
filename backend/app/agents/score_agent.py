"""ScoreCalculationAgent — CertaintyAI-weighted readiness scoring (Phase 1.5)."""
from typing import Any
import logging

logger = logging.getLogger(__name__)

SEMANTIC_SCORES: dict[str, int] = {
    "1-2_same":         85,
    "3-5_aligned":      60,
    "6-10_variation":   35,
    "10plus_different": 15,
}

RAG_SCORES: dict[str, int] = {
    "none":          20,
    "pilot_unknown": 30,
    "pilot_70_85":   70,
    "prod_70_85":    75,
    "prod_above_85": 88,
}

AUDIT_SCORES: dict[str, int] = {"yes": 100, "partial": 50, "no": 0}
OVERSIGHT_SCORES: dict[str, int] = {"formal_committee": 85, "partial_adhoc": 50, "none": 20}

WEIGHTS = {"semantic": 0.30, "rag": 0.20, "audit": 0.20, "oversight": 0.10, "data": 0.10}
BASE_OFFSET = 10

TIERS = [
    (0,   50,  "Low / Foundational",     "AI is a discussion, not yet a discipline."),
    (50,  70,  "Moderate / Developing",  "Pilots exist, but no operational backbone."),
    (70,  85,  "High / Ready",           "AI delivers value; governance is catching up."),
    (85,  101, "Advanced / Scalable",    "AI is a governed, compounding capability."),
]

PROVIDER_MODEL_NAMES: dict[str, str] = {
    "openai_ultra": "GPT-4o",
    "openai_flash": "GPT-4o",
    "anthropic_ultra": "Claude 3.5 Sonnet",
    "anthropic_flash": "Claude 3.5 Haiku",
    "local_hybrid": "Llama 3 (Local Hybrid)",
}


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


def _resolve_tier(total: float) -> tuple[str, str]:
    for lo, hi, tier, tagline in TIERS:
        if lo <= total < hi:
            return tier, tagline
    return TIERS[-1][2], TIERS[-1][3]


def _data_state_score(data_state: dict[str, Any]) -> int:
    score = 70
    quality = data_state.get("quality", []) or []
    freshness = data_state.get("freshness", []) or []
    fmt = data_state.get("format", []) or []
    if "very_messy" in quality:
        score -= 30
    elif "messy" in quality:
        score -= 15
    if "monthly" in freshness:
        score -= 15
    if "unstructured" in fmt and "structured" not in fmt and "both" not in fmt:
        score -= 10
    return max(0, score)


def _nist_rmf_scores(oversight_score: int, rag_score: int) -> dict[str, int]:
    return {"govern": oversight_score, "measure": rag_score}


def calculate_finops_scores(answers: dict[str, Any]) -> dict[str, Any]:
    finops = answers.get("finops", {}) or {}
    
    # 1. AI Compute Cost Efficiency Score (0-100)
    # If finops is a Pydantic model in dictionary representation or pure dict
    if hasattr(finops, "model_dump"):
        finops_dict = finops.model_dump()
    else:
        finops_dict = finops
        
    monthly_spend = finops_dict.get("monthly_spend", 0.0) or 0.0
    primary_provider = finops_dict.get("primary_provider", "openai_flash")
    gpu_constrained = finops_dict.get("gpu_constrained", False)
    
    cost_efficiency = 100.0
    
    # Deduct based on absolute monthly spend relative to typical mid-market sizing
    if monthly_spend > 50000:
        cost_efficiency -= 40
    elif monthly_spend > 15000:
        cost_efficiency -= 25
    elif monthly_spend > 5000:
        cost_efficiency -= 15
    elif monthly_spend > 1000:
        cost_efficiency -= 5
        
    # Deduct based on provider tier (Ultra vs. Flash vs. Local)
    if primary_provider in ["openai_ultra", "anthropic_ultra"]:
        cost_efficiency -= 20
    elif primary_provider in ["openai_flash", "anthropic_flash"]:
        cost_efficiency -= 5
    elif primary_provider == "local_hybrid":
        cost_efficiency += 10 # Bonus for local cost containment
        
    # Deduct if they are GPU constrained (inefficient scaling)
    if gpu_constrained:
        cost_efficiency -= 10
        
    cost_efficiency = max(0, min(100, cost_efficiency))
    
    # 2. IT Workforce Optimization Index (0-100)
    dev_ai_ratio = finops_dict.get("dev_ai_ratio", 0.5) or 0.5
    
    workforce_index = 50.0
    
    # Add based on developer AI tool utilization ratio
    workforce_index += dev_ai_ratio * 40.0
    
    # Deduct based on blockers
    blockers = answers.get("blockers", []) or []
    if "skills_gap" in blockers:
        workforce_index -= 15
    if "budget" in blockers:
        workforce_index -= 10
        
    # Add bonus for high maturity tier
    maturity = answers.get("maturity", []) or []
    if "scaling" in maturity or "optimizing" in maturity:
        workforce_index += 10
        
    workforce_index = max(0, min(100, workforce_index))
    
    return {
        "cost_efficiency": int(cost_efficiency),
        "workforce_optimization": int(workforce_index),
        "monthly_spend": monthly_spend,
        "primary_provider": primary_provider,
        "gpu_constrained": gpu_constrained,
        "dev_ai_ratio": dev_ai_ratio,
        "estimated_waste": int(monthly_spend * (1 - (cost_efficiency / 100.0)))
    }


def calculate_scores(answers: dict[str, Any]) -> dict[str, Any]:
    if answers.get("_is_adapted") and answers.get("_scores"):
        return answers["_scores"]

    explicit_semantic = answers.get("semantic")
    explicit_rag = answers.get("rag")
    explicit_audit = answers.get("audit")
    explicit_oversight = answers.get("oversight")

    semantic = explicit_semantic if explicit_semantic in SEMANTIC_SCORES else "3-5_aligned"
    rag = explicit_rag if explicit_rag in RAG_SCORES else "pilot_unknown"
    audit = explicit_audit if explicit_audit in AUDIT_SCORES else "partial"
    oversight = explicit_oversight if explicit_oversight in OVERSIGHT_SCORES else "partial_adhoc"
    data_state = answers.get("dataState", {}) or {}

    maturity_list = answers.get("maturity", []) or []
    blockers_list = answers.get("blockers", []) or []
    pain_points_list = answers.get("painPoints", []) or []

    is_exploring = any("exploring" in m.lower() or "researching" in m.lower() for m in maturity_list)
    is_piloting = any("pilot" in m.lower() or "concept" in m.lower() for m in maturity_list)
    is_scaling_or_prod = any("production" in m.lower() or "scaling" in m.lower() for m in maturity_list)

    if maturity_list or blockers_list or pain_points_list:
        # 1. Infer Semantic Fragmentation (30% weight) - only if missing or invalid
        if not explicit_semantic or explicit_semantic not in SEMANTIC_SCORES:
            has_silo_blocker = any("silos" in b.lower() or "integration" in b.lower() for b in blockers_list)
            has_silo_pain = any("silos" in p.lower() or "scattered" in p.lower() for p in pain_points_list)
            has_vocab_pain = any("definitions" in p.lower() or "inconsistent" in p.lower() for p in pain_points_list)

            if (has_silo_blocker or has_silo_pain) and has_vocab_pain:
                semantic = "10plus_different"
            elif has_silo_blocker or has_silo_pain:
                semantic = "6-10_variation"
            elif any("quality" in p.lower() or "messy" in p.lower() for p in pain_points_list):
                semantic = "3-5_aligned"
            else:
                semantic = "1-2_same"

        # 2. Infer RAG Accuracy (20% weight) - only if missing or invalid
        if not explicit_rag or explicit_rag not in RAG_SCORES:
            has_hallucinations = any("hallucination" in p.lower() or "inaccurate" in p.lower() for p in pain_points_list)

            if is_exploring:
                rag = "none"
            elif is_piloting:
                rag = "pilot_unknown" if has_hallucinations else "pilot_70_85"
            elif is_scaling_or_prod:
                rag = "prod_70_85" if has_hallucinations else "prod_above_85"
            else:
                rag = "pilot_unknown"

        # 3. Infer Audit Trail & Provenance (20% weight) - only if missing or invalid
        if not explicit_audit or explicit_audit not in AUDIT_SCORES:
            has_explain_pain = any("audit" in p.lower() or "explain" in p.lower() for p in pain_points_list)
            has_explain_blocker = any("explain" in b.lower() for b in blockers_list)

            if has_explain_pain or has_explain_blocker:
                # Apply conditional maturity floor: if piloting or scaling/prod, audit must be at least partial
                if is_scaling_or_prod or is_piloting:
                    audit = "partial"
                else:
                    audit = "no"
            elif is_scaling_or_prod and not has_explain_blocker:
                audit = "yes"
            else:
                audit = "partial"

        # 4. Infer Governance Oversight (10% weight) - only if missing or invalid
        if not explicit_oversight or explicit_oversight not in OVERSIGHT_SCORES:
            has_gov_blocker = any("governance" in b.lower() or "policy" in b.lower() for b in blockers_list)

            if has_gov_blocker:
                # Apply conditional maturity floor: if piloting or scaling/prod, oversight must be at least partial_adhoc
                if is_scaling_or_prod or is_piloting:
                    oversight = "partial_adhoc"
                else:
                    oversight = "none"
            elif is_scaling_or_prod and not has_gov_blocker:
                oversight = "formal_committee"
            else:
                oversight = "partial_adhoc"

    semantic_score  = SEMANTIC_SCORES.get(semantic, 50)
    rag_score       = RAG_SCORES.get(rag, 30)
    audit_score     = AUDIT_SCORES.get(audit, 0)
    oversight_score = OVERSIGHT_SCORES.get(oversight, 20)
    data_score      = _data_state_score(data_state)

    # Apply conditional maturity-based floors to final subscores to prevent logical contradictions
    is_piloting_or_prod = any(any(x in m.lower() for x in ["pilot", "production", "scaling"]) for m in maturity_list)
    if is_piloting_or_prod:
        is_prod = any(any(x in m.lower() for x in ["production", "scaling"]) for m in maturity_list)
        if audit_score < 50:
            audit_score = 50
        if oversight_score < 50:
            oversight_score = 50
        if is_prod and rag_score < 70:
            rag_score = 70
        elif rag_score < 30:
            rag_score = 30
        if semantic_score < 35:
            semantic_score = 35

    weighted = (
        semantic_score  * WEIGHTS["semantic"]
        + rag_score       * WEIGHTS["rag"]
        + audit_score     * WEIGHTS["audit"]
        + oversight_score * WEIGHTS["oversight"]
        + data_score      * WEIGHTS["data"]
    )
    total = int(_clamp(round(weighted) + BASE_OFFSET, 0, 100))
    tier, tagline = _resolve_tier(total)
    finops_scores = calculate_finops_scores(answers)
    
    logger.info(
        "Scores Computed: total=%d, sub_scores=%r, nist_rmf=%r",
        total,
        {
            "semantic": semantic_score,
            "rag": rag_score,
            "audit": audit_score,
            "oversight": oversight_score,
            "data": data_score
        },
        _nist_rmf_scores(oversight_score, rag_score)
    )
    
    return {
        "total_score":      total,
        "maturity_tier":    tier,
        "maturity_tagline": tagline,
        "sub_scores": {
            "semantic":  semantic_score,
            "rag":       rag_score,
            "audit":     audit_score,
            "oversight": oversight_score,
            "data":      data_score,
        },
        "finops": finops_scores,
        "nist_rmf": _nist_rmf_scores(oversight_score, rag_score),
        "score_breakdown": {
            "semantic_weighted":  round(semantic_score  * WEIGHTS["semantic"],  1),
            "rag_weighted":       round(rag_score       * WEIGHTS["rag"],       1),
            "audit_weighted":     round(audit_score     * WEIGHTS["audit"],     1),
            "oversight_weighted": round(oversight_score * WEIGHTS["oversight"], 1),
            "data_weighted":      round(data_score      * WEIGHTS["data"],      1),
            "base_offset":        BASE_OFFSET,
        },
        "provider_model_names": PROVIDER_MODEL_NAMES,
    }


def adapt_to_legacy_answers(intake: dict[str, Any], sub_scores: dict[str, int], email: str | None = None) -> dict[str, Any]:
    """Adapt the dynamic assessment answers to the legacy 14-question survey schema.
    
    This ensures that downstream agents (csuite_features, frameworks, gap_analysis, etc.)
    receive populated, realistic fields rather than empty lists or safe-defaults.
    """
    domain = intake.get("domain", "healthcare")
    org_type = intake.get("orgType", "private")
    org_name = intake.get("org", "Your Organization")
    role = intake.get("role", "Executive")
    
    # Map domain to canonical legacy industry string
    industry_map = {
        "healthcare": "healthcare",
        "finance": "bfsi",
        "cyber": "cybersecurity",
        "education": "education",
        "finops": "finops",
        "consulting": "itconsulting",
        "other": "other"
    }
    industry = industry_map.get(domain, "healthcare")
    
    # Map domains list (used by resolve_frameworks / regulator_paragraph)
    domain_labels = {
        "healthcare": "🏥 Healthcare & Life Sciences",
        "finance": "🏦 BFSI",
        "cyber": "🛡 Cybersecurity",
        "education": "🎓 Education",
        "finops": "⚡ Energy & Utilities",
        "consulting": "💼 IT Consulting",
        "other": "Other regulated industry"
    }
    domains = [domain_labels.get(domain, "🏥 Healthcare & Life Sciences")]
    
    sem = sub_scores.get("semantic", 50)
    rag = sub_scores.get("rag", 50)
    aud = sub_scores.get("audit", 50)
    mat = sub_scores.get("maturity", 50)
    ovs = sub_scores.get("oversight", 50)
    frag = sub_scores.get("frag", 50)
    
    # Map data state
    siloed = frag > 40
    structured_pct = max(0, min(100, int(100 - frag)))
    
    # Match thresholds to SEMANTIC_SCORES keys: 85, 60, 35, 15
    if sem >= 72.5:
        sources_count = 3
        quality_rating = 5
        semantic_key = "1-2_same"
    elif sem >= 47.5:
        sources_count = 12
        quality_rating = 4
        semantic_key = "3-5_aligned"
    elif sem >= 25.0:
        sources_count = 25
        quality_rating = 3
        semantic_key = "6-10_variation"
    else:
        sources_count = 45
        quality_rating = 2
        semantic_key = "10plus_different"
        
    # Match thresholds to RAG_SCORES keys: 88, 75, 70, 30, 20
    if rag >= 81.5:
        rag_key = "prod_above_85"
    elif rag >= 72.5:
        rag_key = "prod_70_85"
    elif rag >= 50.0:
        rag_key = "pilot_70_85"
    elif rag >= 25.0:
        rag_key = "pilot_unknown"
    else:
        rag_key = "none"
        
    # Match thresholds to AUDIT_SCORES keys: 100, 50, 0
    if aud >= 75.0:
        audit_key = "yes"
    elif aud >= 25.0:
        audit_key = "partial"
    else:
        audit_key = "no"
        
    # Match thresholds to OVERSIGHT_SCORES keys: 85, 50, 20
    if ovs >= 67.5:
        oversight_key = "formal_committee"
        has_data_governance = True
        has_ai_policy = True
    elif ovs >= 35.0:
        oversight_key = "partial_adhoc"
        has_data_governance = True
        has_ai_policy = False
    else:
        oversight_key = "none"
        has_data_governance = False
        has_ai_policy = False
        
    # Match thresholds to maturity: 85, 60, 35
    if mat >= 72.5:
        ai_maturity = "optimizing"
        maturity_list = ["Optimizing & Auto-tuning"]
    elif mat >= 47.5:
        ai_maturity = "scaling"
        maturity_list = ["Scaling Across Organization"]
    elif mat >= 27.5:
        ai_maturity = "piloting"
        maturity_list = ["Pilots in Production"]
    else:
        ai_maturity = "exploring"
        maturity_list = ["🔍 Exploring / Researching"]
        
    # Map compliance frameworks based on domain
    frameworks_map = {
        "healthcare": ["HIPAA", "GDPR", "SOC2", "ISO27001"],
        "finance": ["SOX", "PCI_DSS", "GDPR", "Basel III"],
        "cyber": ["NIST CSF", "ISO27001", "SOC2", "FedRAMP"],
        "education": ["FERPA", "GDPR", "SOC2"],
        "finops": ["SOX", "ISO27001"],
        "consulting": ["ISO9001", "SOC2"],
        "other": ["GDPR", "SOC2"]
    }
    compliance_frameworks = frameworks_map.get(domain, ["GDPR", "SOC2"])
    
    # Map blockers
    blockers = []
    if sem < 60:
        blockers.extend(["🔗 Data Integration / Silos", "Poor Data Quality"])
    if ovs < 60:
        blockers.extend(["🏛 Governance & Policy", "🔒 Security & Compliance"])
    if rag < 60:
        blockers.extend(["🔍 Explainability", "👥 Skills Gap"])
    if len(blockers) == 0:
        blockers = ["🧱 Legacy Systems"]
        
    ai_use_cases = ["copilot", "analytics"] if rag < 65 else ["automation", "decision_support"]
    
    # Priority
    priority = "risk_reduction"
    if aud < 50:
        priority = "audit_readiness"
    elif sem < 50:
        priority = "standardization"
        
    data_state_dict = {
        "sources_count": sources_count,
        "structured_pct": structured_pct,
        "siloed": siloed,
        "quality_rating": quality_rating
    }
    
    current_blockers = []
    if sem < 60:
        current_blockers.extend(["data_silos", "no_ontology"])
    if ovs < 60:
        current_blockers.append("compliance_risk")
    if rag < 60:
        current_blockers.append("skills_gap")
    if not current_blockers:
        current_blockers = ["legacy_systems"]

    email_val = email or intake.get("email") or ""
    email_val = email_val.strip().lower()

    return {
        "company": {
            "company_name": org_name,
            "contact_name": "Executive",
            "email": email_val if email_val else None,
            "sector_type": org_type,
            "agency_name": org_name if org_type == "public" else "",
            "department_name": "IT & Infrastructure" if org_type == "public" else "",
            "size": "251-1000"
        },
        "role": role,
        "industry": industry,
        "domains": domains,
        "company_size": "251-1000",
        "ai_maturity": ai_maturity,
        "maturity": maturity_list,
        "ai_use_cases": ai_use_cases,
        "semantic": semantic_key,
        "rag": rag_key,
        "audit": audit_key,
        "oversight": oversight_key,
        "blockers": blockers,
        "current_blockers": current_blockers,
        "priority": priority,
        "dataState": {
            "location": ["hybrid"],
            "format": ["both"],
            "freshness": ["real_time"],
            "quality": ["messy" if frag > 40 else "clean"],
            "volume": "large",
            "sources_count": sources_count,
            "structured_pct": structured_pct,
            "siloed": siloed,
            "quality_rating": quality_rating
        },
        "data_state": data_state_dict,
        "governance": {
            "has_data_governance": has_data_governance,
            "has_ai_policy": has_ai_policy,
            "regulated": True,
            "compliance_frameworks": compliance_frameworks
        },
        "finops": {
            "monthly_spend": 0.0,
            "primary_provider": "openai_flash",
            "gpu_constrained": False,
            "dev_ai_ratio": 0.8
        }
    }


def calculate_dynamic_scores(answers: dict[str, Any], questions: list[dict[str, Any]], intake: dict[str, Any] = None, email: str | None = None) -> dict[str, Any]:
    """Compute readiness scores from the dynamic assessment questionnaire on the server.
    
    This calculates average scores per dimension, matches compliance frameworks,
    and runs the legacy-field adapter to ensure all downstream logic receives populated fields.
    """
    # 1. Average option scores by dimension
    dimension_scores: dict[str, list[int]] = {}
    frag_values: list[int] = []
    
    for q in questions:
        q_id = q["id"]
        q_dim = q["dimension"]
        chosen_val = answers.get(q_id)
        if not chosen_val:
            continue
            
        # Find option corresponding to the chosen value
        chosen_opt = None
        for opt in q.get("options", []):
            if opt["value"] == chosen_val:
                chosen_opt = opt
                break
                
        if chosen_opt:
            score = chosen_opt.get("score")
            if score is None:
                score = chosen_opt.get("s")
            if score is None:
                score = 0
                
            if q_dim not in dimension_scores:
                dimension_scores[q_dim] = []
            dimension_scores[q_dim].append(score)
            
            if q_dim == "semantic":
                frag_values.append(chosen_opt.get("frag", 0))
                
    # Averages or safe defaults
    sem = int(sum(dimension_scores["semantic"]) / len(dimension_scores["semantic"])) if dimension_scores.get("semantic") else 50
    rag = int(sum(dimension_scores["rag"]) / len(dimension_scores["rag"])) if dimension_scores.get("rag") else 50
    aud = int(sum(dimension_scores["audit"]) / len(dimension_scores["audit"])) if dimension_scores.get("audit") else 0
    mat = int(sum(dimension_scores["maturity"]) / len(dimension_scores["maturity"])) if dimension_scores.get("maturity") else 25
    ovs = int(sum(dimension_scores["oversight"]) / len(dimension_scores["oversight"])) if dimension_scores.get("oversight") else 20
    frag = int(sum(frag_values) / len(frag_values)) if frag_values else 50

    # Apply conditional maturity floors:
    # If maturity indicates piloting or production (mat >= 35):
    if mat >= 35:
        if aud < 50:
            aud = 50
        if ovs < 50:
            ovs = 50
        is_prod = mat >= 60
        if is_prod and rag < 70:
            rag = 70
        elif rag < 30:
            rag = 30
        if sem < 35:
            sem = 35
    
    # Calculate overall fit score using the dynamic formula:
    # 35% semantic / 25% rag / 20% audit / 10% maturity / 10% oversight
    overall = int(round(sem * 0.35 + rag * 0.25 + aud * 0.20 + mat * 0.10 + ovs * 0.10))
    overall = max(0, min(100, overall))
    
    tier, tagline = _resolve_tier(overall)
    
    # Compile subscores
    sub_scores = {
        "semantic": sem,
        "rag": rag,
        "audit": aud,
        "oversight": ovs,
        "data": mat,
        "maturity": mat,
        "frag": frag
    }
    
    logger.info(
        "Dynamic Scores Computed: total=%d, sub_scores=%r, nist_rmf=%r",
        overall,
        sub_scores,
        _nist_rmf_scores(ovs, rag)
    )
    
    # 2. Run the legacy-field adapter
    if intake is None:
        intake = answers.get("intake", {})
    legacy_answers = adapt_to_legacy_answers(intake, sub_scores, email)
    
    # 3. Calculate FinOps and NIST RMF scores based on legacy answers
    finops_scores = calculate_finops_scores(legacy_answers)
    
    res = {
        "total_score": overall,
        "maturity_tier": tier,
        "maturity_tagline": tagline,
        "sub_scores": sub_scores,
        "finops": finops_scores,
        "nist_rmf": _nist_rmf_scores(ovs, rag),
        "score_breakdown": {
            "semantic_weighted": round(sem * 0.35, 1),
            "rag_weighted": round(rag * 0.25, 1),
            "audit_weighted": round(aud * 0.20, 1),
            "oversight_weighted": round(ovs * 0.10, 1),
            "data_weighted": round(mat * 0.10, 1),
            "base_offset": 0
        },
        "provider_model_names": PROVIDER_MODEL_NAMES,
        "legacy_answers": legacy_answers
    }
    
    legacy_answers["_is_adapted"] = True
    # Avoid circular references for JSON serialization (e.g. database inserts)
    scores_copy = dict(res)
    scores_copy.pop("legacy_answers", None)
    legacy_answers["_scores"] = scores_copy
    
    return res

