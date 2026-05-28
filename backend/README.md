# HorarioPro — Backend

API REST con FastAPI, SQLAlchemy y Alembic.

## Requisitos

- Python 3.12+
- SQLite (desarrollo) o PostgreSQL (producción)

## Arranque local (sin Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Health: http://localhost:8000/health
- OpenAPI (con `DEBUG=true`): http://localhost:8000/docs

## Migraciones

```bash
alembic upgrade head
alembic revision -m "descripcion" --autogenerate
```

## Variables de entorno

Ver `.env.example`.
