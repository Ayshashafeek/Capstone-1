from datetime import datetime

from fastapi import Cookie, Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_session, hash_password, revoke_session, verify_password
from app.config import settings
from app.db import get_db, init_db
from app.dependencies import get_current_user
from app.models import Grant, Organization, User
from app.schemas import (
    AuthRequest,
    GrantListResponse,
    GrantResponse,
    LoginRequest,
    MeResponse,
    OrganizationResponse,
    OrganizationUpdate,
    UserResponse,
)

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="session_token",
        value=token,
        max_age=settings.session_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie("session_token")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/auth/signup", response_model=MeResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: AuthRequest, response: Response, db: Session = Depends(get_db)) -> MeResponse:
    normalized_email = payload.email.lower()
    existing_user = db.scalar(select(User).where(User.email == normalized_email))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists")

    user = User(email=normalized_email, password_hash=hash_password(payload.password))
    user.organization = Organization(name=payload.organization_name.strip())
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_session(db, user)
    set_session_cookie(response, token)
    return MeResponse(user=UserResponse.model_validate(user), organization=OrganizationResponse.model_validate(user.organization))


@app.post("/api/v1/auth/login", response_model=MeResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> MeResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_session(db, user)
    set_session_cookie(response, token)
    return MeResponse(user=UserResponse.model_validate(user), organization=OrganizationResponse.model_validate(user.organization))


@app.post("/api/v1/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    session_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Response:
    revoke_session(db, session_token)
    clear_session_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@app.get("/api/v1/auth/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        user=UserResponse.model_validate(current_user),
        organization=OrganizationResponse.model_validate(current_user.organization),
    )


@app.get("/api/v1/organization", response_model=OrganizationResponse)
def get_organization(current_user: User = Depends(get_current_user)) -> OrganizationResponse:
    return OrganizationResponse.model_validate(current_user.organization)


@app.put("/api/v1/organization", response_model=OrganizationResponse)
def update_organization(
    payload: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    organization = current_user.organization
    for field, value in payload.model_dump().items():
        setattr(organization, field, value)
    db.commit()
    db.refresh(organization)
    return OrganizationResponse.model_validate(organization)


@app.get("/api/v1/grants", response_model=GrantListResponse)
def list_grants(
    search: str | None = Query(default=None, max_length=100),
    focus_area: str | None = Query(default=None, max_length=80),
    region: str | None = Query(default=None, max_length=80),
    deadline_before: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GrantListResponse:
    grants = list(db.scalars(select(Grant).where(Grant.status == "active").order_by(Grant.deadline.asc(), Grant.title.asc())))
    search_term = search.strip().lower() if search else None
    focus_term = focus_area.strip().lower() if focus_area else None
    region_term = region.strip().lower() if region else None

    def matches(grant: Grant) -> bool:
        if search_term and search_term not in f"{grant.title} {grant.funder} {grant.summary}".lower():
            return False
        if focus_term and not any(focus_term in value.lower() for value in grant.focus_areas):
            return False
        if region_term and not any(region_term in value.lower() for value in grant.eligible_regions):
            return False
        if deadline_before and (not grant.deadline or grant.deadline > deadline_before):
            return False
        return True

    filtered = [grant for grant in grants if matches(grant)]
    start = (page - 1) * page_size
    items = filtered[start:start + page_size]
    return GrantListResponse(
        items=[grant_response(grant) for grant in items],
        page=page,
        page_size=page_size,
        total=len(filtered),
    )


@app.get("/api/v1/grants/{grant_id}", response_model=GrantResponse)
def get_grant(
    grant_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GrantResponse:
    grant = db.get(Grant, grant_id)
    if not grant or grant.status != "active":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grant not found")
    return grant_response(grant)


def grant_response(grant: Grant) -> GrantResponse:
    return GrantResponse(
        id=grant.id,
        title=grant.title,
        funder=grant.funder,
        summary=grant.summary,
        eligibility_text=grant.eligibility_text,
        focus_areas=grant.focus_areas,
        eligible_regions=grant.eligible_regions,
        applicant_types=grant.applicant_types,
        amount_min_cents=grant.amount_min_cents,
        amount_max_cents=grant.amount_max_cents,
        deadline=grant.deadline,
        application_url=grant.application_url,
        canonical_url=grant.canonical_url,
        last_verified_at=grant.last_verified_at,
        source_name=grant.source.name,
        source_type=grant.source.source_type,
    )
