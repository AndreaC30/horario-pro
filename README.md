# horario-pro

Aplicación web **PWA instalable** para registrar jornadas laborales, horas y extras (conducción, desplazamientos).

## Arranque (recomendado)

Un solo comando desde la raíz del repo:

```bash
cp .env.example .env
cp docker-compose.override.example.yml docker-compose.override.yml
# Edita .env: SECRET_KEY, BOOTSTRAP_USER_EMAIL, BOOTSTRAP_USER_PASSWORD
docker compose up -d --build
```

| Servicio | URL |
|----------|-----|
| App (login) | http://localhost:8080 |
| API + Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

Logs: `make docker-logs` · Parar: `make docker-down`

`docker-compose.override.yml` (local, no versionado) aplica SQLite, puertos y usuario bootstrap; la plantilla está en `docker-compose.override.example.yml`.

## Variables `.env` imprescindibles

```env
SECRET_KEY="..."                    # openssl rand -base64 32
BOOTSTRAP_USER_EMAIL=tu@email.com
BOOTSTRAP_USER_PASSWORD=...
VITE_API_BASE_URL=http://localhost:8000
```

## VPS (nginx-proxy centralizado)

```bash
make docker-prod
# Bloque server en ~/nginx-proxy/nginx/conf.d/default.conf
```

Ver [`deploy/nginx-proxy/README.md`](deploy/nginx-proxy/README.md).

## Desarrollo nativo (opcional)

```bash
make dev-backend   # terminal 1
make dev-frontend  # terminal 2 — solo si no usas Docker para la UI
```

## PWA

Tras `docker compose up` o `npm run build` en `frontend/`:

- Manifest + service worker (`vite-plugin-pwa`).
- Instalar: en móvil, «Añadir a pantalla de inicio» / «Instalar app».
- Sin red: lectura cacheada limitada; **guardar** requiere conexión.

Detalle: [`frontend/README.md`](frontend/README.md).

## Estado del pliego (antes de QA)

| Fase | Documento | Estado en repo |
|------|-----------|----------------|
| Backend MVP | `01-backend-tareas.md` | Implementado |
| Frontend 1–6 + UX | `02-frontend`, `04-ux` | Implementado |
| PWA + entrega FE | `02` fases 7–8 | Implementado (FE-071 tests opcional omitido) |
| Infra Docker/nginx | `03-infra-tareas.md` | Compose + proxy; VPS/backups = operación en servidor |
| QA | `05-qa-checklist.md` | API: `make qa-api` · UI/prod: [05-qa-ejecucion.md](docs/pliego/05-qa-ejecucion.md) |

## Documentación

- Planificación: [`docs/pliego/`](docs/pliego/)
- Mejoras v2: [`docs/MEJORAS-V2.md`](docs/MEJORAS-V2.md)
