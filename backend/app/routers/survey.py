"""Survey router — anonymous-allowed POST /survey (Phase 2)."""
from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Union, Any, Literal

from ..agents.orchestrator import generate_readiness_report
from ..agents.security_scanner import sanitize_and_scan_input
from ..agents.embedding_service import generate_profile_signature, create_vector_embedding
from ..agents.llm_client import complete_json
from ..agents.prompts import ASSESSMENT_GENERATION_SYSTEM_PROMPT
from ..agents.score_agent import calculate_dynamic_scores
from ..agents import frameworks, gap_analysis, embedding_service, csuite_features
from ..agents.insights_agent import generate_insights
from ..agents.narrative_agent import generate_narrative
from ..auth import decode_access_token
from ..database import get_db
from ..models import Assessment, User, AssessmentMemory
from ..report.renderer import render_error_page, render_report
from ..schemas import SurveyAnswers, SurveyResponse, GenerateAssessmentRequest, DynamicSurveyAnswers

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/survey", tags=["survey"])

_optional_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# Cache for generated questions, keyed by orgType|domain|role
_QUESTIONS_CACHE: dict[str, list[dict[str, Any]]] = {}

# Verbatim fallback questions matching certaintyai.html template questions
DEFAULT_TEMPLATE_QUESTIONS = [
    {
        "id": "maturity",
        "dimension": "maturity",
        "text": "Where is {org} with AI today?",
        "sub": "",
        "multi": False,
        "options": [
            {"value": "exploring", "label": "Exploring — researching options", "score": 25, "frag": 0},
            {"value": "pilots", "label": "Pilots running", "score": 50, "frag": 0},
            {"value": "production", "label": "In production", "score": 75, "frag": 0},
            {"value": "scaling", "label": "Scaling — but hitting friction", "score": 90, "frag": 0}
        ]
    },
    {
        "id": "semantic",
        "dimension": "semantic",
        "text": "How many systems hold your {entity} data — and do they define it the same way?",
        "sub": "Different teams often label the same {entity} differently — and that mismatch is what blocks reliable AI.",
        "multi": False,
        "options": [
            {"value": "low", "label": "1–2 systems, same definition", "score": 85, "frag": 15},
            {"value": "mod", "label": "3–5 systems, mostly aligned", "score": 60, "frag": 40},
            {"value": "high", "label": "6–10 systems, significant variation", "score": 35, "frag": 70},
            {"value": "sev", "label": "10+ systems, all different", "score": 15, "frag": 90}
        ]
    },
    {
        "id": "rag",
        "dimension": "rag",
        "text": "On complex {industry} questions, how accurate are {org}'s AI answers today?",
        "sub": "Vector-only retrieval typically plateaus at 70–80%. Governed, graph-based retrieval reaches 90–99%.",
        "multi": False,
        "options": [
            {"value": "unk", "label": "We haven't measured", "score": 30, "frag": 0},
            {"value": "u50", "label": "Below 50%", "score": 25, "frag": 0},
            {"value": "5070", "label": "50–70%", "score": 45, "frag": 0},
            {"value": "7085", "label": "70–85%", "score": 70, "frag": 0},
            {"value": "o85", "label": "Above 85%", "score": 88, "frag": 0}
        ]
    },
    {
        "id": "oversight",
        "dimension": "oversight",
        "text": "Does {org} have formal AI oversight in place today?",
        "sub": "",
        "multi": False,
        "options": [
            {"value": "none", "label": "No formal oversight", "score": 20, "frag": 0},
            {"value": "partial", "label": "Partial — some controls", "score": 50, "frag": 0},
            {"value": "formal", "label": "Yes — formal governance", "score": 85, "frag": 0}
        ]
    },
    {
        "id": "audit",
        "dimension": "audit",
        "text": "Can {org} produce a full provenance trail for any AI-generated answer today?",
        "sub": "Sources, confidence scores and decision rationale — increasingly required under {framework}.",
        "multi": False,
        "options": [
            {"value": "full", "label": "Yes, fully", "score": 100, "frag": 0},
            {"value": "part", "label": "Partially, for some systems", "score": 50, "frag": 0},
            {"value": "no", "label": "No, not today", "score": 0, "frag": 0}
        ]
    }
]


def _replace_org_token(questions: list[dict[str, Any]], org: str) -> list[dict[str, Any]]:
    import copy
    copied = copy.deepcopy(questions)
    for q in copied:
        q["text"] = q["text"].replace("{org}", org)
        if "sub" in q and q["sub"]:
            q["sub"] = q["sub"].replace("{org}", org)
    return copied


def _customize_fallback_wording(questions: list[dict[str, Any]], domain: str, role: str) -> list[dict[str, Any]]:
    entity_map = {
        "healthcare": "patient",
        "finance": "customer",
        "cyber": "asset",
        "education": "student",
        "finops": "cost centre",
        "consulting": "client",
        "other": "core entity"
    }
    entity = entity_map.get(domain, "core entity")
    
    industry_label_map = {
        "healthcare": "clinical",
        "finance": "financial",
        "cyber": "security",
        "education": "learning",
        "finops": "cost",
        "consulting": "delivery",
        "other": "operational"
    }
    industry_label = industry_label_map.get(domain, "complex")
    
    frameworks_map = {
        "healthcare": "HIPAA, HITECH and the EU AI Act",
        "finance": "SOX, Basel III and GDPR",
        "cyber": "NIST CSF, ISO 27001 and SOC 2",
        "education": "FERPA, GDPR and the EU AI Act",
        "finops": "SOX, ISO 27001",
        "consulting": "ISO 9001, SOC 2",
        "other": "the EU AI Act, GDPR and SOC 2"
    }
    framework = frameworks_map.get(domain, "the EU AI Act, GDPR and SOC 2")
    
    for q in questions:
        q["text"] = q["text"].replace("{entity}", entity).replace("{industry}", industry_label).replace("{framework}", framework).replace("{role}", role)
        if "sub" in q and q["sub"]:
            q["sub"] = q["sub"].replace("{entity}", entity).replace("{industry}", industry_label).replace("{framework}", framework).replace("{role}", role)
    return questions


@router.post("/generate-questions")
def generate_questions(payload: GenerateAssessmentRequest) -> dict:
    """Generate dynamic, intake-tailored AI readiness assessment questions.
    
    Includes caching by signature (orgType|domain|role) and silent fallback to template questions.
    """
    org_type = payload.orgType
    org = payload.org
    role = payload.role
    domain = payload.domain
    
    cache_key = f"{org_type}|{domain}|{role}"
    
    # 1. Check cache first (ignore org name for cache key, as per spec)
    if cache_key in _QUESTIONS_CACHE:
        logger.info("Retrieved questions from cache for signature: %s", cache_key)
        cached_qs = _QUESTIONS_CACHE[cache_key]
        return {"questions": _replace_org_token(cached_qs, org)}
        
    # 2. Call provider-agnostic LLM client with literal {org} placeholder
    user_message = json.dumps({
        "orgType": org_type,
        "org": "{org}",
        "role": role,
        "domain": domain
    })
    
    try:
        raw_response = complete_json(
            system_prompt=ASSESSMENT_GENERATION_SYSTEM_PROMPT,
            user_message=user_message,
            max_tokens=2000
        )
        
        # Clean up any potential markdown fences
        clean_response = raw_response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        clean_response = clean_response.strip()
        
        data = json.loads(clean_response)
        questions = data.get("questions", [])
        
        # 3. Validate generated questions structure
        if not isinstance(questions, list) or len(questions) < 5:
            raise ValueError("Too few questions generated")
            
        required_dimensions = {"semantic", "rag", "audit", "maturity", "oversight"}
        actual_dimensions = set()
        
        for q in questions:
            if not all(k in q for k in ("id", "dimension", "text", "options")):
                raise ValueError("Question missing required keys")
            if q["dimension"] not in required_dimensions:
                raise ValueError(f"Invalid dimension {q['dimension']}")
            actual_dimensions.add(q["dimension"])
            
            for opt in q["options"]:
                if "score" not in opt and "s" in opt:
                    opt["score"] = opt["s"]
                if "score" not in opt:
                    raise ValueError("Option missing score")
                opt["score"] = max(0, min(100, int(opt["score"])))
                
                if q["dimension"] == "semantic":
                    if "frag" not in opt:
                        opt["frag"] = 100 - opt["score"]
                    opt["frag"] = max(0, min(100, int(opt["frag"])))
                    
        # Check all dimensions covered
        if not required_dimensions.issubset(actual_dimensions):
            raise ValueError("Missing some required dimensions")
            
        # 4. Save to cache
        _QUESTIONS_CACHE[cache_key] = questions
        logger.info("Successfully generated and cached questions for signature: %s", cache_key)
        
        return {"questions": _replace_org_token(questions, org)}
        
    except Exception as exc:
        logger.warning("Assessment questions generation failed, falling back to templates: %s", exc)
        fallback_qs = _replace_org_token(DEFAULT_TEMPLATE_QUESTIONS, org)
        fallback_qs = _customize_fallback_wording(fallback_qs, domain, role)
        return {"questions": fallback_qs}


def _maybe_user(
    token: str | None = Depends(_optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except HTTPException:
        return None
    except JWTError:
        return None
    subject = payload.get("sub")
    if not subject:
        return None
    return db.query(User).filter(User.email == subject).first()


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def submit_survey(
    payload: Union[SurveyAnswers, DynamicSurveyAnswers],
    current: User | None = Depends(_maybe_user),
    db: Session = Depends(get_db),
) -> SurveyResponse:
    # Check if this is the dynamic questionnaire format
    if isinstance(payload, DynamicSurveyAnswers) or (hasattr(payload, "intake") and payload.intake):
        intake = payload.intake
        answers = payload.answers
        questions = payload.questions
        
        contact_email = (payload.email or "").strip().lower()

        # Calculate dynamic scores server-side
        score_results = calculate_dynamic_scores(answers, questions, intake, email=contact_email)
        legacy_answers = score_results["legacy_answers"]
        
        # Write Dynamic Assessment record to database
        assessment = Assessment(
            user_id=current.id if current else None,
            contact_email=contact_email,
            answers=legacy_answers,  # Adapted answers for Saved Reports / Dashboard parity
            scores=score_results,
            report_html="",
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        try:
            logger.info("Orchestrator (Dynamic): compiling features…")
            fw_list = frameworks.resolve_frameworks(
                domains=legacy_answers.get("domains", []) or [],
                domains_other=legacy_answers.get("domains_other", ""),
                custom_frameworks=legacy_answers.get("custom_frameworks", ""),
            )
            fw_by_cat = frameworks.group_by_category(fw_list)
            
            gaps = gap_analysis.run(legacy_answers)
            
            memories = []
            try:
                sig = embedding_service.generate_profile_signature(legacy_answers)
                vector = embedding_service.create_vector_embedding(sig)
                memories = embedding_service.get_similar_memories(db, vector)
            except Exception as exc:
                logger.warning("Failed to retrieve semantic memories: %s", exc)
                
            benchmark = csuite_features.peer_benchmark(
                your_score=score_results["total_score"],
                domains=legacy_answers.get("domains", []) or [],
            )
            roadmap = csuite_features.value_roadmap(legacy_answers)
            roadmap_totals = csuite_features.roadmap_totals(roadmap)
            evidence = csuite_features.evidence_pack_preview(legacy_answers)
            regulator = csuite_features.regulator_paragraph(legacy_answers.get("domains", []) or [])
            
            # Dynamic prompt/role tone is handled in LLM agents natively
            insights = generate_insights(legacy_answers, score_results, fw_list, gaps, memories)
            narrative = generate_narrative(legacy_answers, score_results, fw_list, gaps, insights)
            
            report_data = {
                "answers": legacy_answers,
                "company": legacy_answers.get("company") or {},
                "scores": score_results,
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
            
            assessment.report_html = render_report(report_data)
            
        except Exception as exc:
            logger.exception("Dynamic report generation failed for assessment %s", assessment.id)
            assessment.report_html = render_error_page(str(exc))
            
        db.add(assessment)
        db.commit()
        
        # Persist dynamic assessment semantic memory
        try:
            sig = embedding_service.generate_profile_signature(legacy_answers)
            vector = embedding_service.create_vector_embedding(sig)
            memory = AssessmentMemory(
                assessment_id=assessment.id,
                signature_text=sig,
                embedding_json=json.dumps(vector)
            )
            db.add(memory)
            db.commit()
        except Exception as mem_exc:
            logger.warning("Failed to persist semantic memory: %s", mem_exc)
            
        return SurveyResponse(
            id=assessment.id if current else None,
            anon_token=assessment.anon_token,
            report_url=f"/report/by-token/{assessment.anon_token}",
        )
        
    # Standard legacy flow
    answers = payload.model_dump()
    if (not answers.get("maturity") or len(answers.get("maturity", [])) == 0) and answers.get("ai_use_cases"):
        use_cases = answers.get("ai_use_cases", [])
        if any(x in ["Agentic Workflows", "Analytics", "Coding", "Compliance", "Healthcare", "Customer Support"] for x in use_cases):
            answers["maturity"] = ["In Production", "Scaling Across Organization"]
        else:
            answers["maturity"] = ["🔍 Exploring / Researching"]
            
    if "objectives_other" in answers and isinstance(answers["objectives_other"], str):
        answers["objectives_other"], _ = sanitize_and_scan_input(answers["objectives_other"])
    if "painPoints_other" in answers and isinstance(answers["painPoints_other"], str):
        answers["painPoints_other"], _ = sanitize_and_scan_input(answers["painPoints_other"])
        
    contact_email = (payload.company.email or "").strip().lower()

    assessment = Assessment(
        user_id=current.id if current else None,
        contact_email=contact_email,
        answers=answers,
        scores={},
        report_html="",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    try:
        report = generate_readiness_report(answers, db)
        assessment.scores = report["scores"]
        assessment.report_html = render_report(report)
    except Exception as exc:
        logger.exception("Report generation failed for assessment %s", assessment.id)
        assessment.report_html = render_error_page(str(exc))

    db.add(assessment)
    db.commit()
    
    try:
        sig = generate_profile_signature(answers)
        vector = create_vector_embedding(sig)
        memory = AssessmentMemory(
            assessment_id=assessment.id,
            signature_text=sig,
            embedding_json=json.dumps(vector)
        )
        db.add(memory)
        db.commit()
    except Exception as mem_exc:
        logger.warning("Failed to persist semantic memory vector: %s", mem_exc)

    return SurveyResponse(
        id=assessment.id if current else None,
        anon_token=assessment.anon_token,
        report_url=f"/report/by-token/{assessment.anon_token}",
    )


