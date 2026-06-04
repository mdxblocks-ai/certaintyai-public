"""Seed demo users (and an optional demo assessment) into the DB on startup."""
import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from .agents.orchestrator import generate_readiness_report
from .auth import hash_password
from .models import Assessment, User
from .report.renderer import render_report

logger = logging.getLogger(__name__)

DEMO_USERS_PATH = Path(__file__).resolve().parent.parent / "data" / "demo_users.json"
DEMO_USER_EMAIL = "demo@mdxblocks.com"

DEMO_ASSESSMENT_ANSWERS = {
    "company": {
        "company_name": "Acme Health Network",
        "contact_name": "Dr. Pat Reyes",
        "email": DEMO_USER_EMAIL,
        "additional_deliverables": "ROI Calculator, Benchmark Report",
    },
    "role": "cio_cto",
    "objectives": ["Improve operational efficiency", "Enhance decision accuracy", "Mitigate AI risks"],
    "objectives_other": "",
    "painPoints": ["AI hallucinations / inaccurate responses", "Cannot audit or explain AI decisions"],
    "painPoints_other": "",
    "dataState": {
        "location": ["cloud", "hybrid"],
        "format":   ["structured", "unstructured"],
        "freshness": ["real_time"],
        "quality":  ["messy"],
        "volume":   "medium",
    },
    "domains": ["Healthcare & Life Sciences", "IT Consulting"],
    "domains_other": "",
    "maturity": ["In Production", "Scaling Across Organization"],
    "ai_use_cases": ["General Chat", "Document Summarization"],
    "semantic": "3-5_aligned",
    "rag": "prod_70_85",
    "audit": "partial",
    "oversight": "partial_adhoc",
    "blockers": ["Data Integration / Silos", "Cost / ROI", "Skills Gap"],
    "blockers_other": "",
    "priority": "risk_reduction",
    "custom_frameworks": "ISO 42001, SOC 2",
}


def seed_demo_users(db: Session) -> int:
    if not DEMO_USERS_PATH.exists():
        logger.warning("demo_users.json not found at %s; skipping seed", DEMO_USERS_PATH)
        return 0
    with DEMO_USERS_PATH.open("r", encoding="utf-8") as f:
        entries = json.load(f)
    created = 0
    for entry in entries:
        email = entry["email"]
        if db.query(User).filter(User.email == email).first():
            continue
        db.add(User(
            email=email,
            hashed_password=hash_password(entry["password"]),
            full_name=entry.get("full_name", ""),
            role=entry.get("role", "user"),
        ))
        created += 1
    if created:
        db.commit()
        logger.info("Seeded %d demo user(s)", created)
    else:
        logger.info("Demo users already seeded; nothing to do")
    return created


def seed_demo_assessment(db: Session) -> bool:
    demo_user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if not demo_user:
        logger.info("Demo user %s not found; skipping demo assessment seed.", DEMO_USER_EMAIL)
        return False
    
    # Ensure demo user is marked as completed so they skip the wizard
    if not demo_user.first_assessment_completed:
        demo_user.first_assessment_completed = True
        db.add(demo_user)
        db.commit()

    existing = db.query(Assessment).filter(Assessment.user_id == demo_user.id).first()
    if existing:
        logger.info("Demo user already has an assessment; skipping seed.")
        return False
    logger.info("Seeding demo assessment for %s — this may take 10–20s while the LLM runs…", DEMO_USER_EMAIL)
    try:
        report = generate_readiness_report(DEMO_ASSESSMENT_ANSWERS)
        assessment = Assessment(
            user_id=demo_user.id,
            contact_email=DEMO_USER_EMAIL,
            answers=DEMO_ASSESSMENT_ANSWERS,
            scores=report["scores"],
            report_html=render_report(report),
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        # Seed the corresponding semantic memory record
        try:
            from .agents.embedding_service import generate_profile_signature, create_vector_embedding
            from .models import AssessmentMemory
            sig = generate_profile_signature(DEMO_ASSESSMENT_ANSWERS)
            vec = create_vector_embedding(sig)
            memory = AssessmentMemory(
                assessment_id=assessment.id,
                signature_text=sig,
                embedding_json=json.dumps(vec)
            )
            db.add(memory)
            db.commit()
            logger.info("Seeded corresponding semantic memory for demo assessment id=%s", assessment.id)
        except Exception as mem_exc:
            logger.warning("Failed to seed corresponding semantic memory: %s", mem_exc)
            
        logger.info(
            "Seeded demo assessment id=%s tier=%s total=%s",
            assessment.id, report["scores"].get("maturity_tier"), report["scores"].get("total_score"),
        )
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to seed demo assessment: %s", exc)
        db.rollback()
        return False
