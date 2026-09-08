from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    organization_name: str = Field(default="My organization", min_length=2, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class OrganizationUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    organization_type: str = Field(default="", max_length=80)
    regions: str = Field(default="", max_length=500)
    focus_areas: str = Field(default="", max_length=500)
    annual_budget_cents: int | None = Field(default=None, ge=0)
    team_size: int | None = Field(default=None, ge=1, le=100000)


class OrganizationResponse(OrganizationUpdate):
    id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    user: UserResponse
    organization: OrganizationResponse


class GrantResponse(BaseModel):
    id: str
    title: str
    funder: str
    summary: str
    eligibility_text: str
    focus_areas: list[str]
    eligible_regions: list[str]
    applicant_types: list[str]
    amount_min_cents: int | None
    amount_max_cents: int | None
    deadline: datetime | None
    application_url: str
    canonical_url: str
    last_verified_at: datetime
    source_name: str
    source_type: str
    match_score: int | None = None
    match_reasons: list[str] = []
    missing_criteria: list[str] = []
    is_saved: bool = False


class GrantListResponse(BaseModel):
    items: list[GrantResponse]
    page: int
    page_size: int
    total: int


class SavedGrantCreate(BaseModel):
    grant_id: str


class SavedGrantUpdate(BaseModel):
    status: str = Field(pattern="^(saved|reviewing|applied|rejected|won|archived)$")
    notes: str = Field(default="", max_length=3000)
    follow_up_at: datetime | None = None


class SavedGrantResponse(BaseModel):
    id: str
    status: str
    notes: str
    follow_up_at: datetime | None
    created_at: datetime
    grant: GrantResponse


class DashboardResponse(BaseModel):
    saved_count: int
    active_count: int
    applied_count: int
    pipeline_amount_cents: int
    upcoming_deadlines: list[SavedGrantResponse]
