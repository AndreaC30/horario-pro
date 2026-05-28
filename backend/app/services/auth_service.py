import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse, UserRead

logger = logging.getLogger(__name__)

INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == normalize_email(email)))


def create_user(db: Session, email: str, password: str) -> User:
    normalized = normalize_email(email)
    existing = get_user_by_email(db, normalized)
    if existing:
        raise ValueError(f"El usuario {normalized} ya existe")

    user = User(email=normalized, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def bootstrap_user_if_missing(db: Session, email: str, password: str) -> User | None:
    normalized = normalize_email(email)
    existing = get_user_by_email(db, normalized)
    if existing:
        logger.info("Usuario bootstrap ya existe: %s", normalized)
        return existing

    user = create_user(db, normalized, password)
    logger.info("Usuario bootstrap creado: %s", normalized)
    return user


def login(db: Session, email: str, password: str) -> TokenResponse:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        logger.warning("Intento de login fallido para email=%s", normalize_email(email))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS_MESSAGE,
        )

    token = create_access_token(str(user.id))
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )
