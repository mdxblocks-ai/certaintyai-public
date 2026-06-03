"""Report router — public-by-token + authenticated list/detail (Phase 1.5)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Assessment, User

router = APIRouter(prefix="/report", tags=["report"])


@router.get("")
def list_reports(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    rows = (
        db.query(Assessment)
        .filter(Assessment.user_id == current.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    out = []
    for a in rows:
        scores = a.scores or {}
        answers = a.answers or {}
        company = (answers.get("company") or {})
        out.append({
            "id": a.id,
            "anon_token": a.anon_token,
            "company_name": company.get("company_name", ""),
            "domains": answers.get("domains", []) or [],
            "total_score": scores.get("total_score"),
            "maturity_tier": scores.get("maturity_tier"),
            "maturity_tagline": scores.get("maturity_tagline"),
            "has_report": bool(a.report_html),
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return out


def _load_by_token(token: str, db: Session) -> Assessment:
    a = db.query(Assessment).filter(Assessment.anon_token == token).first()
    if not a:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with token {token[:8]}… not found.",
        )
    return a


@router.get("/by-token/{token}", response_class=HTMLResponse)
def get_report_html_by_token(token: str, db: Session = Depends(get_db)) -> HTMLResponse:
    a = _load_by_token(token, db)
    return HTMLResponse(content=a.report_html or "")


@router.get("/by-token/{token}/data")
def get_report_data_by_token(token: str, db: Session = Depends(get_db)) -> dict:
    a = _load_by_token(token, db)
    return {
        "id": a.id,
        "anon_token": a.anon_token,
        "answers": a.answers or {},
        "scores": a.scores or {},
        "is_claimed": a.user_id is not None,
        "contact_email": a.contact_email,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


def _load_by_id(report_id: int, current: User, db: Session) -> Assessment:
    a = db.query(Assessment).filter(Assessment.id == report_id).first()
    if not a:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    if a.user_id != current.id:
        raise HTTPException(status_code=403, detail="You don't have access to this report.")
    return a


@router.get("/{report_id}", response_class=HTMLResponse)
def get_report_html(
    report_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HTMLResponse:
    a = _load_by_id(report_id, current, db)
    return HTMLResponse(content=a.report_html or "")


@router.get("/{report_id}/data")
def get_report_data(
    report_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    a = _load_by_id(report_id, current, db)
    return {
        "id": a.id,
        "anon_token": a.anon_token,
        "answers": a.answers or {},
        "scores": a.scores or {},
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
