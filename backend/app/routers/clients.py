from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.services import client_service

router = APIRouter(prefix="/api/v1/clients", tags=["clients"])


@router.get("", response_model=list[ClientRead])
def list_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ClientRead]:
    clients = client_service.list_clients(db, current_user.id)
    return [ClientRead.model_validate(client) for client in clients]


@router.post("", response_model=ClientRead, status_code=201)
def create_client(
    body: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRead:
    client = client_service.create_client(db, current_user.id, body)
    return ClientRead.model_validate(client)


@router.get("/{client_id}", response_model=ClientRead)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRead:
    client = client_service.get_client(db, current_user.id, client_id)
    return ClientRead.model_validate(client)


@router.patch("/{client_id}", response_model=ClientRead)
def update_client(
    client_id: int,
    body: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRead:
    client = client_service.update_client(db, current_user.id, client_id, body)
    return ClientRead.model_validate(client)


@router.delete("/{client_id}", status_code=204)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    client_service.delete_client(db, current_user.id, client_id)
