from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_user_by_token
from app.db import get_db
from app.models import User


def get_current_user(
    session_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    user = get_user_by_token(db, session_token)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user
