from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[2]
_REPO_ROOT = _BACKEND_DIR.parent
_ENV_FILES = (
    _BACKEND_DIR / ".env",
    _REPO_ROOT / ".env",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=tuple(str(path) for path in _ENV_FILES if path.is_file()),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "HorarioPro API"
    environment: str = "development"
    debug: bool = False

    database_url: str = "sqlite:///./horariopro.db"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173,http://localhost:8080"
    bootstrap_user_email: str | None = None
    bootstrap_user_password: str | None = None

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        if self.environment == "production" and self.secret_key in ("", "change-me-in-production"):
            raise ValueError("SECRET_KEY debe configurarse en producción")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
