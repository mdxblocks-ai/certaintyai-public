"""Auth router (Phase 1.5) — signup/login/me/change-password + claim-report."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models import Assessment, User
from ..schemas import PasswordChange, Token, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _claim_orphan_assessments(db: Session, user: User) -> int:
    rows = (
        db.query(Assessment)
        .filter(Assessment.user_id.is_(None))
        .filter(Assessment.contact_email == user.email)
        .all()
    )
    for a in rows:
        a.user_id = user.id
        db.add(a)
    if rows:
        db.commit()
    return len(rows)


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    email = _normalize_email(payload.email)
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name or "",
        role=payload.role or "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _claim_orphan_assessments(db, user)
    return Token(access_token=create_access_token(user.email))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    email = _normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    _claim_orphan_assessments(db, user)
    return Token(access_token=create_access_token(user.email))


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)) -> User:
    return current


from pydantic import BaseModel

class RoleUpdate(BaseModel):
    role: str


@router.put("/profile/role", response_model=UserOut)
def update_role(
    payload: RoleUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    current.role = payload.role
    db.add(current)
    db.commit()
    db.refresh(current)
    return current


@router.post("/change-password", status_code=204)
def change_password(
    payload: PasswordChange,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    if not verify_password(payload.current_password, current.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    current.hashed_password = hash_password(payload.new_password)
    db.add(current)
    db.commit()
    return Response(status_code=204)


@router.post("/claim-report/{token}")
def claim_report(
    token: str,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    a = db.query(Assessment).filter(Assessment.anon_token == token).first()
    if not a:
        raise HTTPException(status_code=404, detail="Report not found.")
    if a.user_id and a.user_id != current.id:
        raise HTTPException(status_code=403, detail="Report belongs to another user.")
    a.user_id = current.id
    db.add(a)
    db.commit()
    return {"claimed": True, "report_id": a.id, "anon_token": a.anon_token}
