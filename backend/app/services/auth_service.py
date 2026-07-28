import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse, UserRead

logger = logging.getLogger(__name__)

INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos"
EMAIL_EXISTS_MESSAGE = "Ya existe una cuenta con ese email"


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


def _token_for_user(user: User) -> TokenResponse:
    token = create_access_token(str(user.id))
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


def login(db: Session, email: str, password: str) -> TokenResponse:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        logger.warning("Intento de login fallido para email=%s", normalize_email(email))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS_MESSAGE,
        )
    return _token_for_user(user)


def register(db: Session, email: str, password: str) -> TokenResponse:
    """Crea la cuenta y devuelve token (sesión inmediata, como GastoDeHoy)."""
    normalized = normalize_email(email)
    if get_user_by_email(db, normalized):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=EMAIL_EXISTS_MESSAGE,
        )

    user = User(email=normalized, password_hash=hash_password(password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Registro duplicado para email=%s", normalized)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=EMAIL_EXISTS_MESSAGE,
        ) from exc

    db.refresh(user)
    logger.info("Usuario registrado: %s", normalized)
    return _token_for_user(user)
