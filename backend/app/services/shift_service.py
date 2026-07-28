from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.client import Client
from app.models.shift import Shift
from app.schemas.shift import ShiftCreate, ShiftRead, ShiftUpdate
from app.services import client_service
from app.utils.calculations import estimated_pay, worked_hours


def _to_shift_read(shift: Shift) -> ShiftRead:
    hours = worked_hours(shift.start_time, shift.end_time, shift.break_minutes)
    pay = estimated_pay(
        shift.start_time,
        shift.end_time,
        shift.break_minutes,
        shift.client.hourly_rate,
        shift.driving_extra,
    )
    return ShiftRead(
        id=shift.id,
        client_id=shift.client_id,
        start_time=shift.start_time,
        end_time=shift.end_time,
        break_minutes=shift.break_minutes,
        driving_extra=shift.driving_extra,
        notes=shift.notes,
        created_at=shift.created_at,
        worked_hours=hours,
        estimated_pay=pay,
        client=shift.client,
    )


def get_last_shift(db: Session, user_id: int) -> ShiftRead | None:
    shift = db.scalar(
        select(Shift)
        .options(joinedload(Shift.client))
        .where(Shift.user_id == user_id)
        .order_by(Shift.start_time.desc())
        .limit(1),
    )
    if shift is None:
        return None
    return _to_shift_read(shift)


def export_shifts_csv(
    db: Session,
    user_id: int,
    *,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    client_id: int | None = None,
) -> str:
    import csv
    import io

    shifts = list_shifts(
        db,
        user_id,
        date_from=date_from,
        date_to=date_to,
        client_id=client_id,
        limit=100,
        offset=0,
    )
    # Export may need more than 100; page until empty
    all_rows = list(shifts)
    offset = 100
    while len(shifts) == 100:
        shifts = list_shifts(
            db,
            user_id,
            date_from=date_from,
            date_to=date_to,
            client_id=client_id,
            limit=100,
            offset=offset,
        )
        all_rows.extend(shifts)
        offset += 100

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "id",
            "cliente",
            "inicio",
            "fin",
            "descanso_min",
            "horas",
            "extra_conduccion",
            "estimado_eur",
            "notas",
        ],
    )
    for s in all_rows:
        writer.writerow(
            [
                s.id,
                s.client.name,
                s.start_time.isoformat(),
                s.end_time.isoformat(),
                s.break_minutes,
                str(s.worked_hours),
                str(s.driving_extra),
                "" if s.estimated_pay is None else str(s.estimated_pay),
                s.notes or "",
            ],
        )
    return buf.getvalue()


def list_shifts(
    db: Session,
    user_id: int,
    *,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    client_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[ShiftRead]:
    query = (
        select(Shift)
        .options(joinedload(Shift.client))
        .where(Shift.user_id == user_id)
        .order_by(Shift.start_time.desc())
    )
    if date_from is not None:
        query = query.where(Shift.start_time >= date_from)
    if date_to is not None:
        query = query.where(Shift.start_time <= date_to)
    if client_id is not None:
        query = query.where(Shift.client_id == client_id)

    shifts = db.scalars(query.limit(limit).offset(offset)).unique().all()
    return [_to_shift_read(shift) for shift in shifts]


def get_shift(db: Session, user_id: int, shift_id: int) -> ShiftRead:
    shift = db.scalar(
        select(Shift)
        .options(joinedload(Shift.client))
        .where(Shift.id == shift_id, Shift.user_id == user_id),
    )
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada no encontrada")
    return _to_shift_read(shift)


def create_shift(db: Session, user_id: int, data: ShiftCreate) -> ShiftRead:
    client = client_service.get_client(db, user_id, data.client_id)
    if client.archived_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede registrar una jornada con un cliente archivado",
        )
    shift = Shift(
        user_id=user_id,
        client_id=data.client_id,
        start_time=data.start_time,
        end_time=data.end_time,
        break_minutes=data.break_minutes,
        driving_extra=data.driving_extra,
        notes=data.notes,
    )
    db.add(shift)
    db.commit()
    shift = db.scalar(
        select(Shift).options(joinedload(Shift.client)).where(Shift.id == shift.id),
    )
    assert shift is not None
    return _to_shift_read(shift)


def update_shift(db: Session, user_id: int, shift_id: int, data: ShiftUpdate) -> ShiftRead:
    shift = db.scalar(
        select(Shift).options(joinedload(Shift.client)).where(Shift.id == shift_id, Shift.user_id == user_id),
    )
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada no encontrada")

    payload = data.model_dump(exclude_unset=True)
    if "client_id" in payload:
        client_service.get_client(db, user_id, payload["client_id"])
        shift.client_id = payload["client_id"]
    if "start_time" in payload:
        shift.start_time = payload["start_time"]
    if "end_time" in payload:
        shift.end_time = payload["end_time"]
    if "break_minutes" in payload:
        shift.break_minutes = payload["break_minutes"]
    if "driving_extra" in payload:
        shift.driving_extra = payload["driving_extra"]
    if "notes" in payload:
        shift.notes = payload["notes"]

    merged = ShiftCreate(
        client_id=shift.client_id,
        start_time=shift.start_time,
        end_time=shift.end_time,
        break_minutes=shift.break_minutes,
        driving_extra=shift.driving_extra,
        notes=shift.notes,
    )
    try:
        ShiftCreate.model_validate(merged.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    db.commit()
    db.refresh(shift)
    shift = db.scalar(
        select(Shift).options(joinedload(Shift.client)).where(Shift.id == shift.id),
    )
    assert shift is not None
    return _to_shift_read(shift)


def delete_shift(db: Session, user_id: int, shift_id: int) -> None:
    shift = db.scalar(select(Shift).where(Shift.id == shift_id, Shift.user_id == user_id))
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada no encontrada")
    db.delete(shift)
    db.commit()
