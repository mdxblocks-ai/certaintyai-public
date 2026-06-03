"""Tests for the deterministic ScoreCalculationAgent (Phase 1.5 — CertaintyAI algorithm)."""
from app.agents.score_agent import (
    AUDIT_SCORES,
    BASE_OFFSET,
    OVERSIGHT_SCORES,
    RAG_SCORES,
    SEMANTIC_SCORES,
    WEIGHTS,
    calculate_scores,
)


def _profile(**overrides):
    """Builder so each test only writes the fields that matter to it."""
    base = {
        "semantic":  "3-5_aligned",
        "rag":       "pilot_unknown",
        "audit":     "partial",
        "oversight": "partial_adhoc",
        "dataState": {
            "location": ["cloud"],
            "format":   ["structured"],
            "freshness": ["real_time"],
            "quality":  ["clean"],
            "volume":   "medium",
        },
    }
    base.update(overrides)
    return base


# ---------- Sub-score lookups ----------

def test_semantic_lookup_matches_spec():
    assert SEMANTIC_SCORES == {
        "1-2_same":         85,
        "3-5_aligned":      60,
        "6-10_variation":   35,
        "10plus_different": 15,
    }


def test_rag_lookup_matches_spec():
    assert RAG_SCORES == {
        "none":          20,
        "pilot_unknown": 30,
        "pilot_70_85":   70,
        "prod_70_85":    75,
        "prod_above_85": 88,
    }


def test_audit_and_oversight_lookups_match_spec():
    assert AUDIT_SCORES == {"yes": 100, "partial": 50, "no": 0}
    assert OVERSIGHT_SCORES == {"formal_committee": 85, "partial_adhoc": 50, "none": 20}


def test_weights_and_offset_match_spec():
    assert WEIGHTS == {"semantic": 0.30, "rag": 0.20, "audit": 0.20, "oversight": 0.10, "data": 0.10}
    assert BASE_OFFSET == 10


# ---------- Tier banding ----------

def test_low_foundational_profile():
    out = calculate_scores(_profile(
        semantic="10plus_different",
        rag="none",
        audit="no",
        oversight="none",
        dataState={
            "location": [],
            "format":   ["unstructured"],
            "freshness": ["monthly"],
            "quality":  ["very_messy"],
            "volume":   "large",
        },
    ))
    assert out["maturity_tier"] == "Low / Foundational"
    assert 0 <= out["total_score"] < 50


def test_advanced_scalable_profile():
    out = calculate_scores(_profile(
        semantic="1-2_same",
        rag="prod_above_85",
        audit="yes",
        oversight="formal_committee",
        dataState={
            "location": ["cloud", "hybrid"],
            "format":   ["structured"],
            "freshness": ["real_time"],
            "quality":  ["clean"],
            "volume":   "medium",
        },
    ))
    assert out["maturity_tier"] == "Advanced / Scalable"
    assert out["total_score"] >= 85


def test_moderate_developing_in_middle_band():
    out = calculate_scores(_profile())  # defaults are deliberately middle-of-the-road
    assert 50 <= out["total_score"] < 70
    assert out["maturity_tier"] == "Moderate / Developing"


# ---------- Data-state deductions ----------

def test_data_state_deductions_are_additive():
    out = calculate_scores(_profile(
        dataState={
            "location": ["cloud"],
            "format":   ["unstructured"],   # -10 (unstructured-only)
            "freshness": ["monthly"],       # -15
            "quality":  ["very_messy"],     # -30
            "volume":   "large",
        },
    ))
    # 70 - 30 - 15 - 10 = 15
    assert out["sub_scores"]["data"] == 15


def test_data_state_quality_clean_keeps_full_70():
    out = calculate_scores(_profile())
    assert out["sub_scores"]["data"] == 70


# ---------- NIST RMF projection ----------

def test_nist_rmf_govern_tracks_oversight_and_measure_tracks_rag():
    out = calculate_scores(_profile(oversight="formal_committee", rag="prod_above_85"))
    assert out["nist_rmf"]["govern"]  == OVERSIGHT_SCORES["formal_committee"]
    assert out["nist_rmf"]["measure"] == RAG_SCORES["prod_above_85"]


# ---------- Shape ----------

def test_return_shape():
    out = calculate_scores(_profile())
    assert set(out.keys()) >= {
        "total_score", "maturity_tier", "maturity_tagline",
        "sub_scores", "nist_rmf", "score_breakdown",
    }
    assert set(out["sub_scores"].keys()) == {"semantic", "rag", "audit", "oversight", "data"}
    assert set(out["nist_rmf"].keys()) == {"govern", "measure"}
    assert isinstance(out["total_score"], int)
    assert 0 <= out["total_score"] <= 100


def test_total_score_is_weighted_sum_plus_offset():
    """Spot-check the exact formula on a hand-computable example."""
    out = calculate_scores(_profile(
        semantic="1-2_same",        # 85 * 0.30 = 25.5
        rag="prod_above_85",        # 88 * 0.20 = 17.6
        audit="yes",                # 100 * 0.20 = 20.0
        oversight="formal_committee",  # 85 * 0.10 = 8.5
        # data clean = 70 * 0.10    = 7.0
    ))
    assert out["total_score"] == 89


def test_dynamic_scoring_and_legacy_adaptation():
    from app.agents.score_agent import calculate_dynamic_scores
    
    questions = [
        {
            "id": "q1",
            "dimension": "semantic",
            "text": "Question 1",
            "options": [
                {"value": "opt1", "label": "Label 1", "score": 80, "frag": 20},
                {"value": "opt2", "label": "Label 2", "score": 40, "frag": 60}
            ]
        },
        {
            "id": "q2",
            "dimension": "rag",
            "text": "Question 2",
            "options": [
                {"value": "opt1", "label": "Label 1", "score": 90},
                {"value": "opt2", "label": "Label 2", "score": 50}
            ]
        },
        {
            "id": "q3",
            "dimension": "audit",
            "text": "Question 3",
            "options": [
                {"value": "opt1", "label": "Label 1", "score": 100},
                {"value": "opt2", "label": "Label 2", "score": 0}
            ]
        },
        {
            "id": "q4",
            "dimension": "maturity",
            "text": "Question 4",
            "options": [
                {"value": "opt1", "label": "Label 1", "score": 75},
                {"value": "opt2", "label": "Label 2", "score": 25}
            ]
        },
        {
            "id": "q5",
            "dimension": "oversight",
            "text": "Question 5",
            "options": [
                {"value": "opt1", "label": "Label 1", "score": 85},
                {"value": "opt2", "label": "Label 2", "score": 20}
            ]
        }
    ]
    
    answers = {
        "q1": "opt2", # semantic: 40, frag: 60
        "q2": "opt1", # rag: 90
        "q3": "opt1", # audit: 100
        "q4": "opt2", # maturity: 25 (exploring, floors not triggered)
        "q5": "opt2", # oversight: 20
    }
    
    intake = {
        "orgType": "private",
        "org": "Test Corp",
        "role": "CFO",
        "domain": "finance"
    }
    
    res = calculate_dynamic_scores(answers, questions, intake)
    
    # Check that scores calculated via the dynamic formula:
    # 40*0.35 + 90*0.25 + 100*0.20 + 25*0.10 + 20*0.10
    # = 14.0 + 22.5 + 20.0 + 2.5 + 2.0 = 61
    assert res["total_score"] == 61
    
    sub = res["sub_scores"]
    assert sub["semantic"] == 40
    assert sub["rag"] == 90
    assert sub["audit"] == 100
    assert sub["maturity"] == 25
    assert sub["oversight"] == 20
    assert sub["frag"] == 60
    
    # Check legacy answers mapping
    legacy = res["legacy_answers"]
    assert legacy["company"]["company_name"] == "Test Corp"
    assert legacy["company"]["sector_type"] == "private"
    assert legacy["role"] == "CFO"
    assert legacy["industry"] == "bfsi"
    assert legacy["ai_maturity"] == "exploring" # mat is 25 (<27.5)
    assert legacy["dataState"]["structured_pct"] == 40
    assert legacy["dataState"]["siloed"] is True
    assert legacy["dataState"]["quality_rating"] == 3 # sem is 40 (>30 <=50)
    assert legacy["data_state"]["sources_count"] == 25
    assert legacy["data_state"]["structured_pct"] == 40
    assert legacy["data_state"]["siloed"] is True
    assert legacy["data_state"]["quality_rating"] == 3
    assert legacy["current_blockers"] == ["data_silos", "no_ontology", "compliance_risk"]
    assert legacy["governance"]["has_data_governance"] is False
    assert legacy["governance"]["has_ai_policy"] is False
    assert "SOX" in legacy["governance"]["compliance_frameworks"]


def test_score_consistency_and_mid_range():
    from app.agents.score_agent import calculate_dynamic_scores, calculate_scores
    from app.report.renderer import render_report
    import re

    # 1. Setup a mid-range input profile (average ~50)
    questions = [
        {
            "id": "q1", "dimension": "semantic", "options": [
                {"value": "opt1", "score": 50, "frag": 50}
            ]
        },
        {
            "id": "q2", "dimension": "rag", "options": [
                {"value": "opt1", "score": 50}
            ]
        },
        {
            "id": "q3", "dimension": "audit", "options": [
                {"value": "opt1", "score": 50}
            ]
        },
        {
            "id": "q4", "dimension": "maturity", "options": [
                {"value": "opt1", "score": 50}
            ]
        },
        {
            "id": "q5", "dimension": "oversight", "options": [
                {"value": "opt1", "score": 50}
            ]
        }
    ]
    answers = {"q1": "opt1", "q2": "opt1", "q3": "opt1", "q4": "opt1", "q5": "opt1"}
    intake = {
        "orgType": "public",
        "org": "Department of Education",
        "role": "CTO",
        "domain": "education"
    }

    # Calculate scores
    score_results = calculate_dynamic_scores(answers, questions, intake)
    total_score = score_results["total_score"]
    
    # Assert score is in sensible mid-range (~50)
    assert 40 <= total_score <= 60

    # 2. Assert that _is_adapted pass-through works in calculate_scores
    legacy_answers = score_results["legacy_answers"]
    assert legacy_answers["_is_adapted"] is True
    
    recalculated = calculate_scores(legacy_answers)
    assert recalculated == legacy_answers["_scores"]

    # 3. Assert all three render-points agree on the overall score
    from app.agents import frameworks, gap_analysis, csuite_features
    from datetime import datetime, timezone
    
    fw_list = frameworks.resolve_frameworks(
        domains=legacy_answers.get("domains", []) or [],
        domains_other=legacy_answers.get("domains_other", ""),
        custom_frameworks=legacy_answers.get("custom_frameworks", ""),
    )
    fw_by_cat = frameworks.group_by_category(fw_list)
    gaps = gap_analysis.run(legacy_answers)
    benchmark = csuite_features.peer_benchmark(
        your_score=score_results["total_score"],
        domains=legacy_answers.get("domains", []) or [],
    )
    roadmap = csuite_features.value_roadmap(legacy_answers)
    roadmap_totals = csuite_features.roadmap_totals(roadmap)
    evidence = csuite_features.evidence_pack_preview(legacy_answers)
    regulator = csuite_features.regulator_paragraph(legacy_answers.get("domains", []) or [])
    
    report_data = {
        "answers": legacy_answers,
        "company": legacy_answers.get("company", {}),
        "scores": score_results,
        "frameworks": fw_list,
        "frameworks_by_category": fw_by_cat,
        "gap_analysis": gaps,
        "peer_benchmark": benchmark,
        "value_roadmap": roadmap,
        "value_roadmap_totals": roadmap_totals,
        "evidence_pack": evidence,
        "regulator_paragraph": regulator,
        "insights": {},
        "narrative": {"executive_summary": "Test Summary"},
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }

    html = render_report(report_data)

    # Assert that the score value shows in all 3 render points:
    # 1. Hero Ring: <div class="num">{{ scores.total_score }}</div>
    hero_pattern = rf'<div class="num">\s*{total_score}\s*</div>'
    assert re.search(hero_pattern, html) is not None

    # 2. Narrative/Comparison: Your <strong>AI Readiness Score ({{ scores.total_score }})</strong>
    narrative_pattern = rf'AI Readiness Score \({total_score}\)'
    assert re.search(narrative_pattern, html) is not None

    # 3. Dashboard card: <div class="val" style="color: var(--amber);">{{ scores.total_score }}...
    # Since total_score is 50, it will use style="color: var(--amber);" and 🟡 Needs Attention
    card_score_pattern = rf'{total_score}<span style="font-size: 12px; color: var\(--muted\); font-weight: 400;">/100</span>'
    assert re.search(card_score_pattern, html) is not None


def test_in_production_mid_maturity_answers_non_zero():
    # Test (a) In-production/mid maturity answer set yields non-zero subscores and overall above single digits
    from app.agents.score_agent import calculate_scores, calculate_dynamic_scores
    
    # 1. Standard/Legacy scoring
    payload = {
        "semantic": "3-5_aligned",
        "rag": "pilot_unknown",
        "audit": "partial",
        "oversight": "partial_adhoc",
        "maturity": ["In Production"],
        "blockers": ["Governance & Policy", "Security & Compliance"],
        "painPoints": ["Cannot audit or explain AI decisions"],
    }
    scores = calculate_scores(payload)
    
    assert scores["total_score"] > 9  # meaningfully above single digits
    assert scores["sub_scores"]["audit"] > 0
    assert scores["sub_scores"]["oversight"] > 0
    assert scores["sub_scores"]["rag"] > 0
    assert scores["nist_rmf"]["govern"] > 0
    assert scores["nist_rmf"]["measure"] > 0

    # 2. Dynamic scoring
    questions = [
        {"id": "q1", "dimension": "semantic", "options": [{"value": "opt1", "score": 50, "frag": 50}]},
        {"id": "q2", "dimension": "rag", "options": [{"value": "opt1", "score": 50}]},
        {"id": "q3", "dimension": "audit", "options": [{"value": "opt1", "score": 50}]},
        {"id": "q4", "dimension": "maturity", "options": [{"value": "opt1", "score": 60}]}, # In production/scaling
        {"id": "q5", "dimension": "oversight", "options": [{"value": "opt1", "score": 50}]}
    ]
    answers = {"q1": "opt1", "q2": "opt1", "q3": "opt1", "q4": "opt1", "q5": "opt1"}
    intake = {"orgType": "private", "org": "Test Corp", "role": "CFO", "domain": "finance"}
    
    res = calculate_dynamic_scores(answers, questions, intake)
    assert res["total_score"] > 9
    assert res["sub_scores"]["audit"] > 0
    assert res["sub_scores"]["oversight"] > 0
    assert res["sub_scores"]["rag"] > 0
    assert res["nist_rmf"]["govern"] > 0
    assert res["nist_rmf"]["measure"] > 0


def test_low_maturity_answers_low_scores():
    # Test (b) Genuninely low-maturity answers yield low subscores (and real zeros)
    from app.agents.score_agent import calculate_scores, calculate_dynamic_scores
    
    # 1. Standard/Legacy scoring
    payload = {
        "semantic": "10plus_different",
        "rag": "none",
        "audit": "no",
        "oversight": "none",
        "maturity": ["🔍 Exploring / Researching"],
        "blockers": ["Governance & Policy", "Security & Compliance"],
        "painPoints": ["Cannot audit or explain AI decisions"],
    }
    scores = calculate_scores(payload)
    
    # Genuine zero values permitted under exploring path
    assert scores["sub_scores"]["audit"] == 0

    # 2. Dynamic scoring
    questions = [
        {"id": "q1", "dimension": "semantic", "options": [{"value": "opt1", "score": 0, "frag": 100}]},
        {"id": "q2", "dimension": "rag", "options": [{"value": "opt1", "score": 0}]},
        {"id": "q3", "dimension": "audit", "options": [{"value": "opt1", "score": 0}]},
        {"id": "q4", "dimension": "maturity", "options": [{"value": "opt1", "score": 20}]}, # exploring
        {"id": "q5", "dimension": "oversight", "options": [{"value": "opt1", "score": 0}]}
    ]
    answers = {"q1": "opt1", "q2": "opt1", "q3": "opt1", "q4": "opt1", "q5": "opt1"}
    intake = {"orgType": "private", "org": "Test Corp", "role": "CFO", "domain": "finance"}
    
    res = calculate_dynamic_scores(answers, questions, intake)
    
    # Ensure they can still reach low scores
    assert res["sub_scores"]["audit"] == 0
    assert res["sub_scores"]["oversight"] == 0
    assert res["sub_scores"]["rag"] == 0
    assert res["total_score"] == 2 # 20 * 0.10 = 2



