"""Tests for Role-Aware Question Generation (Path 2) and Invariant Scoring."""
from unittest.mock import patch
import pytest

from app.schemas import GenerateAssessmentRequest
from app.routers.survey import generate_questions
from app.agents.score_agent import calculate_dynamic_scores


def test_role_ciso_questions():
    """Verify that when CISO / Security Director role generates questions and LLM fails,
    the fallback questions contain all 5 security concern-lens keywords.
    """
    payload = GenerateAssessmentRequest(
        orgType="private",
        org="Security Corp",
        role="Security Director",
        domain="cyber"
    )

    # Force LLM client failure to trigger template fallback
    with patch("app.routers.survey.complete_json", side_effect=Exception("LLM failure")):
        response = generate_questions(payload)
        questions = response.get("questions", [])
        
        assert len(questions) == 5
        
        # Flatten all text/options labels into a single string for scanning
        all_text = ""
        for q in questions:
            all_text += q["text"] + " " + q.get("sub", "") + " "
            for opt in q["options"]:
                all_text += opt["label"] + " "
        
        all_text_lower = all_text.lower()
        
        # Security concern-lens keywords: data leakage, access control, shadow AI, prompt injection, and audit logging
        assert "data leakage" in all_text_lower
        assert "access control" in all_text_lower
        assert "shadow-ai" in all_text_lower or "shadow ai" in all_text_lower
        assert "prompt injection" in all_text_lower
        assert "audit logging" in all_text_lower


def test_role_cfo_questions():
    """Verify that when CFO role generates questions and LLM fails,
    the fallback questions contain all 5 CFO concern-lens keywords.
    """
    payload = GenerateAssessmentRequest(
        orgType="private",
        org="Astra Finance",
        role="CFO",
        domain="finance"
    )

    # Force LLM client failure to trigger template fallback
    with patch("app.routers.survey.complete_json", side_effect=Exception("LLM failure")):
        response = generate_questions(payload)
        questions = response.get("questions", [])
        
        assert len(questions) == 5
        
        all_text = ""
        for q in questions:
            all_text += q["text"] + " " + q.get("sub", "") + " "
            for opt in q["options"]:
                all_text += opt["label"] + " "
        
        all_text_lower = all_text.lower()
        
        # CFO concern-lens keywords: ROI, spend governance (or spend approvals / budget limits), payback (or payback tracking), FinOps, defensible numbers (or financial ledger)
        assert "roi" in all_text_lower
        assert "spend approvals" in all_text_lower or "spend governance" in all_text_lower or "budget limits" in all_text_lower
        assert "payback" in all_text_lower
        assert "finops" in all_text_lower
        assert "defensible" in all_text_lower or "financial ledger" in all_text_lower


def test_scoring_invariants():
    """Verify the dual-scenario invariants for ScoreCalculationAgent.
    - In-Production Scenario: Returns exactly 61.
    - Low-Maturity Scenario: Returns exactly 16.
    """
    # 1. In-Production Scenario: sem=40, rag=90, aud=100, mat=25, ovs=20
    # Formula: sem*0.35 + rag*0.25 + aud*0.20 + mat*0.10 + ovs*0.10
    # = 40*0.35 + 90*0.25 + 100*0.20 + 25*0.10 + 20*0.10 = 14 + 22.5 + 20 + 2.5 + 2 = 61.0 -> 61
    questions_in_prod = [
        {
            "id": "q_sem",
            "dimension": "semantic",
            "options": [{"value": "v_sem", "score": 40, "frag": 60}]
        },
        {
            "id": "q_rag",
            "dimension": "rag",
            "options": [{"value": "v_rag", "score": 90}]
        },
        {
            "id": "q_aud",
            "dimension": "audit",
            "options": [{"value": "v_aud", "score": 100}]
        },
        {
            "id": "q_mat",
            "dimension": "maturity",
            "options": [{"value": "v_mat", "score": 25}]
        },
        {
            "id": "q_ovs",
            "dimension": "oversight",
            "options": [{"value": "v_ovs", "score": 20}]
        }
    ]
    answers_in_prod = {
        "q_sem": "v_sem",
        "q_rag": "v_rag",
        "q_aud": "v_aud",
        "q_mat": "v_mat",
        "q_ovs": "v_ovs"
    }
    intake = {
        "orgType": "private",
        "org": "InProd Corp",
        "role": "CTO",
        "domain": "healthcare"
    }
    res_in_prod = calculate_dynamic_scores(answers_in_prod, questions_in_prod, intake)
    assert res_in_prod["total_score"] == 61

    # 2. Low-Maturity Scenario: sem=15, rag=25, aud=0, mat=25, ovs=20
    # Formula: sem*0.35 + rag*0.25 + aud*0.20 + mat*0.10 + ovs*0.10
    # = 15*0.35 + 25*0.25 + 0*0.20 + 25*0.10 + 20*0.10 = 5.25 + 6.25 + 0 + 2.5 + 2 = 16.0 -> 16
    questions_low_mat = [
        {
            "id": "q_sem",
            "dimension": "semantic",
            "options": [{"value": "v_sem", "score": 15, "frag": 85}]
        },
        {
            "id": "q_rag",
            "dimension": "rag",
            "options": [{"value": "v_rag", "score": 25}]
        },
        {
            "id": "q_aud",
            "dimension": "audit",
            "options": [{"value": "v_aud", "score": 0}]
        },
        {
            "id": "q_mat",
            "dimension": "maturity",
            "options": [{"value": "v_mat", "score": 25}]
        },
        {
            "id": "q_ovs",
            "dimension": "oversight",
            "options": [{"value": "v_ovs", "score": 20}]
        }
    ]
    answers_low_mat = {
        "q_sem": "v_sem",
        "q_rag": "v_rag",
        "q_aud": "v_aud",
        "q_mat": "v_mat",
        "q_ovs": "v_ovs"
    }
    res_low_mat = calculate_dynamic_scores(answers_low_mat, questions_low_mat, intake)
    assert res_low_mat["total_score"] == 16
