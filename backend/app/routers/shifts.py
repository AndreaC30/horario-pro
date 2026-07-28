from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.shift import ShiftCreate, ShiftRead, ShiftUpdate
from app.services import shift_service

router = APIRouter(prefix="/api/v1/shifts", tags=["shifts"])


@router.get("", response_model=list[ShiftRead])
def list_shifts(
    date_from: datetime | None = Query(default=None, alias="from"),
    date_to: datetime | None = Query(default=None, alias="to"),
    client_id: int | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ShiftRead]:
    return shift_service.list_shifts(
        db,
        current_user.id,
        date_from=date_from,
        date_to=date_to,
        client_id=client_id,
        limit=limit,
        offset=offset,
    )


@router.get("/last", response_model=ShiftRead | None)
def get_last_shift(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShiftRead | None:
    return shift_service.get_last_shift(db, current_user.id)


@router.get("/export")
def export_shifts(
    date_from: datetime | None = Query(default=None, alias="from"),
    date_to: datetime | None = Query(default=None, alias="to"),
    client_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    csv_text = shift_service.export_shifts_csv(
        db,
        current_user.id,
        date_from=date_from,
        date_to=date_to,
        client_id=client_id,
    )
    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="workshift-jornadas.csv"'},
    )


@router.post("", response_model=ShiftRead, status_code=201)
def create_shift(
    body: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShiftRead:
    return shift_service.create_shift(db, current_user.id, body)


@router.get("/{shift_id}", response_model=ShiftRead)
def get_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShiftRead:
    return shift_service.get_shift(db, current_user.id, shift_id)


@router.patch("/{shift_id}", response_model=ShiftRead)
def update_shift(
    shift_id: int,
    body: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShiftRead:
    return shift_service.update_shift(db, current_user.id, shift_id, body)


@router.delete("/{shift_id}", status_code=204)
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    shift_service.delete_shift(db, current_user.id, shift_id)
