# horario-pro

Aplicación web responsive/PWA que permite a un trabajador registrar rápidamente jornadas laborales, horas trabajadas y extras asociados al trabajo (como conducción o desplazamientos).

## Estado del proyecto

- **Fase 0** — Esqueleto backend (FastAPI), frontend (React/Vite/Tailwind), Docker Compose y migración inicial de BD.
- Documentación de planificación: [`docs/pliego/`](docs/pliego/).

## Arranque rápido

### Docker (pruebas locales)

```bash
cp .env.example .env
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| API health | http://localhost:8000/health |
| SPA | http://localhost:8080 |

`docker-compose.override.yml` publica puertos y usa SQLite (sin PostgreSQL).

### Desarrollo nativo

```bash
# Terminal 1 — API
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
alembic upgrade head && uvicorn app.main:app --reload --port 8000

# Terminal 2 — UI
cd frontend && npm install && cp .env.example .env && npm run dev
```

Atajos: `make dev-backend`, `make dev-frontend`, `make docker-up`.

## Estructura

```
backend/     # FastAPI, SQLAlchemy, Alembic
frontend/    # React, Vite, Tailwind
deploy/      # Notas Nginx / VPS
docs/        # Pliego y mejoras v2
```

## VPS

Nginx en el host (no en Compose). Ver [`deploy/README.md`](deploy/README.md).

Producción con Postgres: `docker compose --profile postgres up -d --build`
