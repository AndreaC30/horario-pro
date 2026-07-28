import logging

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import (
    http_exception_handler,
    unhandled_exception_handler,
    pydantic_validation_exception_handler,
    validation_exception_handler,
)
from app.core.logging_config import setup_logging
from app.routers import auth, clients, dashboard, health, shifts, timer

settings = get_settings()
setup_logging(debug=settings.debug)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.debug or settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(shifts.router)
app.include_router(dashboard.router)
app.include_router(timer.router)


@app.on_event("startup")
def on_startup() -> None:
    from app.db.session import SessionLocal
    from app.services import auth_service

    if settings.bootstrap_user_email and settings.bootstrap_user_password:
        db = SessionLocal()
        try:
            auth_service.bootstrap_user_if_missing(
                db,
                settings.bootstrap_user_email,
                settings.bootstrap_user_password,
            )
        finally:
            db.close()

    logger.info("HorarioPro API started (env=%s)", settings.environment)
