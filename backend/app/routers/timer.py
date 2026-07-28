from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.timer import TimerRead, TimerStartRequest, TimerStopResponse
from app.services import timer_service

router = APIRouter(prefix="/api/v1/timer", tags=["timer"])


@router.get("", response_model=TimerRead | None)
def get_timer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimerRead | None:
    return timer_service.get_active_timer(db, current_user.id)


@router.post("/start", response_model=TimerRead, status_code=201)
def start_timer(
    body: TimerStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimerRead:
    return timer_service.start_timer(db, current_user.id, body)


@router.post("/stop", response_model=TimerStopResponse)
def stop_timer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimerStopResponse:
    return timer_service.stop_timer(db, current_user.id)
