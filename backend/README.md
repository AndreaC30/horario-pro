# HorarioPro — Backend

API REST con FastAPI, SQLAlchemy y Alembic.

## Arranque recomendado (Docker, desde la raíz del repo)

```bash
# En .env define BOOTSTRAP_USER_EMAIL y BOOTSTRAP_USER_PASSWORD
docker compose up -d --build
```

API: http://localhost:8000/docs · Health: http://localhost:8000/health

## Primer usuario (MVP)

Sin registro público. Opciones:

1. **Variables en `.env`** (recomendado con Docker):
   ```env
   BOOTSTRAP_USER_EMAIL=tu@email.com
   BOOTSTRAP_USER_PASSWORD=tu-contraseña
   ```
   Se crea al arrancar el contenedor si no existe.

2. **CLI manual**:
   ```bash
   cd backend
   .venv/bin/python -m app.cli create-user --email tu@email.com --password tu-contraseña
   ```
   Falla si el email ya existe (idempotente con `bootstrap-user`).

## Auth (fase 1)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Email + password → JWT |
| GET | `/api/v1/auth/me` | Usuario autenticado (Bearer) |

## Desarrollo local (opcional)

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Usa el `.env` de la raíz del monorepo o `backend/.env`.

## Migraciones

```bash
.venv/bin/alembic upgrade head
```
