import logging
import secrets
import string

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.mail import SMTPNotConfiguredError, send_forgot_password_email
from app.models.user import User
from app.schemas.auth import TokenResponse, UserRead, UserUpdate

logger = logging.getLogger(__name__)

INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos"
EMAIL_EXISTS_MESSAGE = "Ya existe una cuenta con ese email"
FORGOT_PASSWORD_MESSAGE = (
    "Si el correo existe y el envío está disponible, recibirás una contraseña temporal."
)


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


def update_profile(db: Session, user: User, data: UserUpdate) -> User:
    payload = data.model_dump(exclude_unset=True)
    if "display_name" in payload:
        name = payload["display_name"]
        user.display_name = name.strip() if isinstance(name, str) and name.strip() else None
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta",
        )
    user.password_hash = hash_password(new_password)
    db.add(user)
    db.commit()


def _random_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def forgot_password(db: Session, email: str) -> str:
    settings = get_settings()
    if not (settings.smtp_host and settings.smtp_host.strip()):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "La recuperación por correo no está disponible: falta configuración SMTP "
                "en el servidor (SMTP_HOST, remitente, credenciales)."
            ),
        )

    user = get_user_by_email(db, email)
    if user is None:
        return FORGOT_PASSWORD_MESSAGE

    temp_pw = _random_password()
    user.password_hash = hash_password(temp_pw)
    try:
        db.flush()
        send_forgot_password_email(normalize_email(email), temp_pw)
        db.commit()
    except SMTPNotConfiguredError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        db.rollback()
        logger.exception("forgot-password: fallo al enviar correo")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo enviar el correo. Inténtalo más tarde.",
        ) from exc

    return FORGOT_PASSWORD_MESSAGE
