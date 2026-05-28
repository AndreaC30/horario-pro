# horario-pro

Aplicación web responsive/PWA para registrar jornadas laborales, horas y extras (conducción, desplazamientos).

## Arranque (recomendado)

Un solo comando desde la raíz del repo:

```bash
cp .env.example .env
# Edita .env: SECRET_KEY, BOOTSTRAP_USER_EMAIL, BOOTSTRAP_USER_PASSWORD
docker compose up -d --build
```

| Servicio | URL |
|----------|-----|
| App (login) | http://localhost:8080 |
| API + Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

Logs: `make docker-logs` · Parar: `make docker-down`

`docker-compose.override.yml` aplica SQLite, puertos locales y creación del usuario bootstrap.

## Variables `.env` imprescindibles

```env
SECRET_KEY="..."                    # openssl rand -base64 32
BOOTSTRAP_USER_EMAIL=tu@email.com
BOOTSTRAP_USER_PASSWORD=...
VITE_API_BASE_URL=http://localhost:8000
```

## VPS (Nginx en el host)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build
```

Ver [`deploy/README.md`](deploy/README.md).

## Desarrollo nativo (opcional)

```bash
make dev-backend   # terminal 1
make dev-frontend  # terminal 2 — solo si no usas Docker para la UI
```

## Documentación

- Planificación: [`docs/pliego/`](docs/pliego/)
- Mejoras v2: [`docs/MEJORAS-V2.md`](docs/MEJORAS-V2.md)
