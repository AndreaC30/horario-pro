from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.active_timer import ActiveTimer
from app.schemas.timer import TimerRead, TimerStartRequest, TimerStopResponse
from app.services import client_service


def _elapsed_seconds(started_at: datetime, now: datetime | None = None) -> int:
    end = now or datetime.now(timezone.utc)
    start = started_at if started_at.tzinfo else started_at.replace(tzinfo=timezone.utc)
    return max(0, int((end - start).total_seconds()))


def _to_read(timer: ActiveTimer) -> TimerRead:
    return TimerRead(
        id=timer.id,
        client_id=timer.client_id,
        started_at=timer.started_at,
        notes=timer.notes,
        created_at=timer.created_at,
        client=timer.client,
        elapsed_seconds=_elapsed_seconds(timer.started_at),
    )


def get_active_timer(db: Session, user_id: int) -> TimerRead | None:
    timer = db.scalar(
        select(ActiveTimer)
        .options(joinedload(ActiveTimer.client))
        .where(ActiveTimer.user_id == user_id),
    )
    if timer is None:
        return None
    return _to_read(timer)


def start_timer(db: Session, user_id: int, data: TimerStartRequest) -> TimerRead:
    existing = db.scalar(select(ActiveTimer).where(ActiveTimer.user_id == user_id))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya hay un cronómetro en curso. Páralo antes de iniciar otro.",
        )
    client = client_service.get_client(db, user_id, data.client_id)
    if client.archived_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede iniciar el cronómetro con un cliente archivado",
        )
    timer = ActiveTimer(
        user_id=user_id,
        client_id=data.client_id,
        started_at=datetime.now(timezone.utc),
        notes=data.notes,
    )
    db.add(timer)
    db.commit()
    timer = db.scalar(
        select(ActiveTimer).options(joinedload(ActiveTimer.client)).where(ActiveTimer.id == timer.id),
    )
    assert timer is not None
    return _to_read(timer)


def stop_timer(db: Session, user_id: int) -> TimerStopResponse:
    from datetime import timedelta

    timer = db.scalar(
        select(ActiveTimer)
        .options(joinedload(ActiveTimer.client))
        .where(ActiveTimer.user_id == user_id),
    )
    if timer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay cronómetro activo")

    end_time = datetime.now(timezone.utc)
    start_time = timer.started_at
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    if end_time <= start_time:
        end_time = start_time + timedelta(minutes=1)

    response = TimerStopResponse(
        client_id=timer.client_id,
        start_time=start_time,
        end_time=end_time,
        break_minutes=0,
        driving_extra=0,
        notes=timer.notes,
        client=timer.client,
    )
    db.delete(timer)
    db.commit()
    return response
