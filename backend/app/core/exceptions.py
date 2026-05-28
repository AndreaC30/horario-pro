from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, list):
        message = detail
    elif isinstance(detail, dict):
        message = detail
    else:
        message = str(detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": message, "code": f"http_{exc.status_code}"},
    )


def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "code": "validation_error",
        },
    )


def unhandled_exception_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "code": "internal_error",
        },
    )
