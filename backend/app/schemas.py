"""Pydantic request and response schemas (Phase 1.5 — CertaintyAI 14-question shape)."""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# Auth schemas
# ============================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = ""
    role: str = "user"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: str
    first_assessment_completed: bool
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ============================================================
# Survey — 14-question CertaintyAI shape
# ============================================================

Role = str
Semantic = Literal["1-2_same", "3-5_aligned", "6-10_variation", "10plus_different"]
RagAccuracy = Literal["none", "pilot_unknown", "pilot_70_85", "prod_70_85", "prod_above_85"]
Audit = Literal["yes", "partial", "no"]
Oversight = Literal["formal_committee", "partial_adhoc", "none"]
Priority = Literal["risk_reduction", "audit_readiness", "standardization", "cost_control", "speed_to_production"]


class CompanyInfo(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    additional_deliverables: str = ""
    agency_name: str = ""
    department_name: str = ""
    sector_type: Optional[str] = "public"


class DataState(BaseModel):
    location: list[Literal["cloud", "on_premises", "hybrid"]] = Field(default_factory=list)
    format: list[Literal["structured", "unstructured", "both"]] = Field(default_factory=list)
    freshness: list[Literal["real_time", "weekly", "monthly"]] = Field(default_factory=list)
    quality: list[Literal["clean", "messy", "very_messy"]] = Field(default_factory=list)
    volume: Optional[Literal["small", "medium", "large"]] = None


class FinOpsState(BaseModel):
    monthly_spend: float = Field(0.0, ge=0)
    primary_provider: Literal["openai_ultra", "openai_flash", "anthropic_ultra", "anthropic_flash", "local_hybrid"] = "openai_flash"
    gpu_constrained: bool = False
    dev_ai_ratio: float = Field(0.5, ge=0, le=1.0)


class SurveyAnswers(BaseModel):
    company: CompanyInfo
    role: Role
    objectives: list[str] = Field(default_factory=list)
    objectives_other: str = ""
    painPoints: list[str] = Field(default_factory=list)
    painPoints_other: str = ""
    dataState: DataState
    domains: list[str] = Field(default_factory=list)
    domains_other: str = ""
    maturity: list[str] = Field(default_factory=list)
    ai_use_cases: list[str] = Field(default_factory=list)
    semantic: Semantic
    rag: RagAccuracy
    audit: Audit
    oversight: Oversight
    blockers: list[str] = Field(default_factory=list)
    blockers_other: str = ""
    priority: Priority
    custom_frameworks: str = ""
    finops: Optional[FinOpsState] = None



# ============================================================
# Responses
# ============================================================

class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    anon_token: Optional[str] = None
    scores: dict
    created_at: datetime


class SurveyResponse(BaseModel):
    id: Optional[int] = None
    anon_token: str
    report_url: str


from typing import Any

class GenerateAssessmentRequest(BaseModel):
    orgType: Literal["public", "private"]
    org: str = Field(..., min_length=1)
    role: str = Field(..., min_length=1)
    domain: Literal["healthcare", "finance", "cyber", "education", "finops", "consulting", "other"]


class DynamicSurveyAnswers(BaseModel):
    intake: dict[str, Any]
    answers: dict[str, Any]
    questions: list[dict[str, Any]]
    email: Optional[str] = None


# ============================================================
# Agent Builder schemas
# ============================================================

class AgentDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    agent_id: int
    source_type: str
    source_ref: str
    status: str
    indexed_at: datetime


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    instructions: str = ""
    icon: str = "ti-robot"
    role: str = "ciso"
    model: str = "Gemini 2.5 · Vertex AI"
    temperature: float = Field(0.3, ge=0.0, le=1.0)
    max_steps: int = Field(25, ge=1, le=100)
    tools: list[str] = Field(default_factory=list)
    voice_enabled: bool = True


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: Optional[str] = None
    icon: Optional[str] = None
    role: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_steps: Optional[int] = Field(None, ge=1, le=100)
    tools: Optional[list[str]] = None
    voice_enabled: Optional[bool] = None


class AgentRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    agent_id: int
    input: str
    steps: list[dict]
    outcome: str
    follow_ups: list[str] = Field(default_factory=list)
    retrieved_sources: list[str] = Field(default_factory=list)
    status: str
    started_at: datetime
    finished_at: datetime
    owner_id: int


class AgentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    instructions: str
    icon: str
    role: str
    model: str
    temperature: float
    max_steps: int
    tools: list[str]
    voice_enabled: bool
    owner_id: int
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    run_count: int = 0
    documents: list[AgentDocumentOut] = Field(default_factory=list)


class AgentRunRequest(BaseModel):
    input: str
    history: list[dict] = Field(default_factory=list)
    attached_doc_ref: Optional[str] = None
    attached_doc_content: Optional[str] = None


