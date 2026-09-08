from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import create_session, hash_password, revoke_session, verify_password
from app.config import settings
from app.db import get_db, init_db
from app.dependencies import get_current_user
from app.models import Organization, User
from app.schemas import (
    AuthRequest,
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
