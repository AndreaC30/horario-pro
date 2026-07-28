from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.shift import Shift
from app.schemas.client import ClientCreate, ClientUpdate


def list_clients(db: Session, user_id: int, *, include_archived: bool = False) -> list[Client]:
    query = select(Client).where(Client.user_id == user_id)
    if not include_archived:
        query = query.where(Client.archived_at.is_(None))
    return list(db.scalars(query.order_by(Client.name.asc())).all())


def get_client(db: Session, user_id: int, client_id: int) -> Client:
    client = db.scalar(
        select(Client).where(Client.id == client_id, Client.user_id == user_id),
    )
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado")
    return client


def create_client(db: Session, user_id: int, data: ClientCreate) -> Client:
    client = Client(
        user_id=user_id,
        name=data.name.strip(),
        color=data.color,
        hourly_rate=data.hourly_rate,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def update_client(db: Session, user_id: int, client_id: int, data: ClientUpdate) -> Client:
    client = get_client(db, user_id, client_id)
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["name"] = updates["name"].strip()
    for field, value in updates.items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


def archive_client(db: Session, user_id: int, client_id: int) -> Client:
    client = get_client(db, user_id, client_id)
    if client.archived_at is None:
        client.archived_at = datetime.now(timezone.utc)
        db.add(client)
        db.commit()
        db.refresh(client)
    return client


def unarchive_client(db: Session, user_id: int, client_id: int) -> Client:
    client = get_client(db, user_id, client_id)
    if client.archived_at is not None:
        client.archived_at = None
        db.add(client)
        db.commit()
        db.refresh(client)
    return client


def delete_client(db: Session, user_id: int, client_id: int) -> None:
    client = get_client(db, user_id, client_id)
    has_shifts = db.scalar(select(Shift.id).where(Shift.client_id == client_id).limit(1))
    if has_shifts:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar un cliente con jornadas asociadas",
        )
    db.delete(client)
    db.commit()
