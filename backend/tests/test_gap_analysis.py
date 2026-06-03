"""Tests for the deterministic gap_analysis module (Phase 1.5)."""
from app.agents import gap_analysis


def _baseline_answers(**overrides):
    base = {
        "domains": [],
        "maturity": [],
        "semantic":  "3-5_aligned",
        "rag":       "pilot_unknown",
        "audit":     "partial",
        "oversight": "partial_adhoc",
        "dataState": {"quality": ["clean"]},
    }
    base.update(overrides)
    return base


# ---------- Recommendations ----------

def test_recommendations_are_five_with_week_ranges():
    out = gap_analysis.run(_baseline_answers())
    assert len(out["recommendations"]) == 5
    week_ranges = [r["week_range"] for r in out["recommendations"]]
    assert week_ranges == [
        "Week 1–2", "Week 2–4", "Week 3–5", "Week 4–6", "Week 6–8",
    ]
    # Order field is 1-indexed
    assert [r["order"] for r in out["recommendations"]] == [1, 2, 3, 4, 5]


def test_recommendations_each_have_action_and_rationale():
    out = gap_analysis.run(_baseline_answers())
    for r in out["recommendations"]:
        assert r["action"], "Missing action"
        assert r["rationale"], "Missing rationale"


# ---------- Strengths ----------

def test_strengths_always_include_leadership_commitment():
    out = gap_analysis.run(_baseline_answers())
    assert any("leadership" in s.lower() for s in out["strengths"])


def test_strengths_include_one_line_per_industry():
    out = gap_analysis.run(_baseline_answers(domains=["Healthcare & Life Sciences", "IT Consulting"]))
    joined = " ".join(out["strengths"]).lower()
    assert "healthcare" in joined
    assert "it consulting" in joined


def test_strengths_add_production_line_when_scaling():
    out = gap_analysis.run(_baseline_answers(maturity=["In Production", "Scaling Across Organization"]))
    assert any("production" in s.lower() for s in out["strengths"])


# ---------- Gaps ----------

def test_semantic_gap_fires_unless_best_case():
    bad = gap_analysis.run(_baseline_answers(semantic="6-10_variation"))
    assert any("semantic" in g.lower() for g in bad["gaps"])
    good = gap_analysis.run(_baseline_answers(semantic="1-2_same"))
    assert not any("semantic" in g.lower() for g in good["gaps"])


def test_rag_gap_fires_unless_prod_above_85():
    bad = gap_analysis.run(_baseline_answers(rag="prod_70_85"))
    assert any("accuracy" in g.lower() for g in bad["gaps"])
    good = gap_analysis.run(_baseline_answers(rag="prod_above_85"))
    assert not any("accuracy" in g.lower() for g in good["gaps"])


def test_audit_gap_fires_unless_yes():
    bad = gap_analysis.run(_baseline_answers(audit="partial"))
    assert any("provenance" in g.lower() for g in bad["gaps"])
    good = gap_analysis.run(_baseline_answers(audit="yes"))
    assert not any("provenance" in g.lower() for g in good["gaps"])


def test_oversight_gap_fires_unless_formal_committee():
    bad = gap_analysis.run(_baseline_answers(oversight="none"))
    assert any("governance" in g.lower() for g in bad["gaps"])
    good = gap_analysis.run(_baseline_answers(oversight="formal_committee"))
    assert not any("governance" in g.lower() for g in good["gaps"])


def test_data_quality_gap_fires_on_messy_or_worse():
    for q in ("messy", "very_messy"):
        out = gap_analysis.run(_baseline_answers(dataState={"quality": [q]}))
        assert any("data quality" in g.lower() for g in out["gaps"]), q
    clean = gap_analysis.run(_baseline_answers(dataState={"quality": ["clean"]}))
    assert not any("data quality" in g.lower() for g in clean["gaps"])


def test_perfect_profile_produces_empty_gap_list_but_keeps_recommendations():
    out = gap_analysis.run(_baseline_answers(
        semantic="1-2_same",
        rag="prod_above_85",
        audit="yes",
        oversight="formal_committee",
        dataState={"quality": ["clean"]},
    ))
    assert out["gaps"] == []
    assert len(out["recommendations"]) == 5  # always-on
