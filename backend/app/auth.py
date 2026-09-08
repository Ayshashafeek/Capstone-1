from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets

from argon2 import PasswordHasher
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Session as UserSession, User

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except Exception:
        return False


def create_session(db: Session, user: User) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_id = sha256(raw_token.encode()).hexdigest()
    session = UserSession(
        id=token_id,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.session_days),
    )
    db.add(session)
    db.commit()
    return raw_token


def get_user_by_token(db: Session, raw_token: str | None) -> User | None:
    if not raw_token:
        return None
    token_id = sha256(raw_token.encode()).hexdigest()
    session = db.scalar(select(UserSession).where(UserSession.id == token_id))
    expires_at = session.expires_at.replace(tzinfo=timezone.utc) if session and session.expires_at.tzinfo is None else session.expires_at if session else None
    if not session or expires_at < datetime.now(timezone.utc):
        if session:
            db.delete(session)
            db.commit()
        return None
    return db.get(User, session.user_id)


def revoke_session(db: Session, raw_token: str | None) -> None:
    if not raw_token:
        return
    token_id = sha256(raw_token.encode()).hexdigest()
    session = db.get(UserSession, token_id)
    if session:
        db.delete(session)
        db.commit()
