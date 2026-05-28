# Pliego de infraestructura — Horario Pro (MVP)

**Alcance:** VPS Linux, Docker Compose, Nginx como reverse proxy, contenedores separados (frontend / backend / base de datos), HTTPS, SQLite en desarrollo y camino hacia PostgreSQL en producción. **Fuera de alcance MVP:** Kubernetes, microservicios, orquestación multi-nodo.

**Convenciones de estimación:** `S` = 0,5–1 día, `M` = 1–2 días, `L` = 3–5 días.

---

## Arquitectura objetivo (MVP)

```text
Internet → Nginx (TLS) → frontend (estático/API gateway)
                      → backend (API)
                      → db (PostgreSQL en prod; SQLite solo dev local)
```

| Entorno | Base de datos | Despliegue |
|---------|---------------|------------|
| Dev local (sin Docker) | SQLite en volumen/archivo local | `npm` / runtime nativo |
| Dev con Docker | SQLite en volumen nombrado | `docker compose -f compose.dev.yml` |
| Producción (VPS) | PostgreSQL 16+ en contenedor | `docker compose -f compose.prod.yml` + Nginx en host o contenedor |

---

## Ejemplo de servicios y variables (sin secretos reales)

### `compose.prod.yml` (nombres de referencia)

| Servicio Compose | Imagen / build | Puerto interno | Notas |
|------------------|----------------|----------------|-------|
| `horario-frontend` | build `./frontend` | `80` | SPA/PWA; assets estáticos |
| `horario-backend` | build `./backend` | `3000` | API REST; health `/health` |
| `horario-db` | `postgres:16-alpine` | `5432` | Solo red interna `horario-internal` |
| `horario-nginx` | `nginx:alpine` *(opcional en Compose)* | `80`, `443` | Alternativa: Nginx instalado en el host |

### Variables de entorno (`.env.example`)

```bash
# --- Comunes ---
NODE_ENV=production
APP_BASE_URL=https://horario.ejemplo.com
TZ=Europe/Madrid

# --- Backend ---
BACKEND_PORT=3000
DATABASE_URL=postgresql://horario_app:CHANGE_ME@horario-db:5432/horario_pro
JWT_SECRET=CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32
CORS_ORIGIN=https://horario.ejemplo.com

# --- Frontend (build-time / runtime según stack) ---
VITE_API_BASE_URL=https://horario.ejemplo.com/api

# --- PostgreSQL (servicio horario-db) ---
POSTGRES_DB=horario_pro
POSTGRES_USER=horario_app
POSTGRES_PASSWORD=CHANGE_ME

# --- Dev solo (compose.dev.yml) ---
# DATABASE_URL=file:/data/horario.sqlite
# SQLITE_PATH=/data/horario.sqlite
```

### Redes y volúmenes (ejemplo)

```yaml
# Fragmento ilustrativo — no es el compose final
networks:
  horario-internal:
    driver: bridge

volumes:
  horario_pg_data:
  horario_sqlite_dev:   # solo dev
```

---

## Fase 0 — Preparación del repositorio

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-000 | Definir estructura `deploy/` o `infra/` | Existen rutas acordadas: `compose.dev.yml`, `compose.prod.yml`, `nginx/`, `.env.example`, README de despliegue | S |
| INF-001 | Documentar prerequisitos | README lista: Docker 24+, Compose v2, dominio DNS, puertos 80/443, usuario no root en VPS | S |
| INF-002 | Plantilla `.env.example` | Todas las variables usadas en compose están documentadas; sin valores secretos reales | S |

---

## Fase 1 — Desarrollo local (sin obligar Docker)

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-101 | SQLite en dev | Backend arranca con `DATABASE_URL` apuntando a archivo local; datos persisten entre reinicios | M |
| INF-102 | Scripts de arranque local | `package.json` o Makefile con `dev:backend`, `dev:frontend`; documentados en README | S |
| INF-103 | Healthcheck backend | Endpoint `GET /health` responde 200 y comprueba conectividad a SQLite | S |
| INF-104 | CORS y URL de API en dev | Frontend en `localhost:5173` (o puerto acordado) llama al backend sin errores CORS | S |

**Entregable fase:** desarrollador puede registrar jornadas en local con SQLite sin instalar PostgreSQL.

---

## Fase 2 — Docker Compose (dev y prod)

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-201 | `Dockerfile` backend | Imagen multi-stage o slim; usuario no root; expone puerto documentado | M |
| INF-202 | `Dockerfile` frontend | Build de producción servido por Nginx embebido o estáticos copiados a volumen | M |
| INF-203 | `compose.dev.yml` | Servicios `horario-backend`, `horario-frontend` (opcional), volumen SQLite; `docker compose up` funcional | M |
| INF-204 | `compose.prod.yml` | Servicios `horario-frontend`, `horario-backend`, `horario-db`; DB sin puerto publicado al host | M |
| INF-205 | Red interna | Backend solo alcanza DB por hostname `horario-db`; frontend no expone credenciales de DB | S |
| INF-206 | Healthchecks Compose | `depends_on` con condición `service_healthy` donde aplique; reinicio `unless-stopped` | S |
| INF-207 | Migraciones en arranque | Script/documento: migraciones se ejecutan antes o al iniciar backend (idempotente) | M |
| INF-208 | `.dockerignore` | Builds reproducibles; sin `node_modules` ni `.env` en contexto | S |

**Entregable fase:** `docker compose -f compose.prod.yml up -d` levanta stack completo en máquina de prueba.

---

## Fase 3 — Nginx y HTTPS

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-301 | Config Nginx reverse proxy | `/` → frontend; `/api` → `horario-backend:3000`; headers `X-Forwarded-*` correctos | M |
| INF-302 | TLS con Let's Encrypt | Certbot o `certbot` en host; renovación automática documentada; HTTP→HTTPS redirect | M |
| INF-303 | Headers de seguridad | `HSTS`, `X-Content-Type-Options`, `X-Frame-Options` (ajustar si PWA lo requiere) | S |
| INF-304 | Límites y timeouts | `client_max_body_size` acorde a uploads; timeouts proxy documentados | S |
| INF-305 | Rate limiting básico | Límite por IP en rutas `/api` (valor inicial documentado, tunable) | S |

**Decisión pendiente:** Nginx en host vs contenedor `horario-nginx` — ver [Preguntas abiertas](#preguntas-abiertas).

**Entregable fase:** dominio de prueba sirve SPA y API solo por HTTPS.

---

## Fase 4 — Checklist de producción (VPS)

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-401 | Aprovisionar VPS | Ubuntu 22.04/24.04 LTS; SSH con clave; usuario deploy sin root login | M |
| INF-402 | Hardening mínimo | UFW: 22 (restringido), 80, 443; fail2ban opcional documentado | M |
| INF-403 | Instalar Docker | Docker Engine + Compose plugin; usuario deploy en grupo `docker` | S |
| INF-404 | DNS | Registro A/AAAA apunta al VPS; propagación verificada | S |
| INF-405 | Despliegue inicial | Clonar repo/tag; copiar `.env` desde plantilla; `compose.prod.yml up -d` | M |
| INF-406 | Smoke test post-deploy | HTTPS OK; login/registro jornada E2E; logs sin errores críticos 15 min | S |
| INF-407 | Logs y rotación | `docker compose logs` documentado; logrotate o driver `json-file` con límites | S |
| INF-408 | Actualizaciones | Procedimiento: pull imagen/tag → `compose up -d` → smoke; ventana de mantenimiento | S |
| INF-409 | Monitoreo mínimo | Uptime externo (ej. health URL) o script cron; alerta por email opcional | S |

### Checklist manual pre-go-live

- [ ] `.env` en servidor con permisos `600`, fuera de git
- [ ] `POSTGRES_PASSWORD` y `JWT_SECRET` generados con entropía fuerte
- [ ] Backup de volumen `horario_pg_data` probado al menos una vez
- [ ] Certificado TLS válido > 30 días
- [ ] Puertos de DB no expuestos en `ss -tlnp` desde Internet
- [ ] Versión desplegada etiquetada en git (`git describe` o tag release)

---

## Fase 5 — Backup, restore y migración SQLite → PostgreSQL

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-501 | Backup PostgreSQL | Cron diario: `pg_dump` a almacenamiento externo (S3-compatible o rsync); retención 7/30 días documentada | M |
| INF-502 | Restore documentado | Procedimiento probado en entorno staging: restaurar dump en volumen nuevo y arrancar stack | M |
| INF-503 | Backup dev SQLite | Copia de archivo `.sqlite` antes de migraciones destructivas | S |
| INF-504 | Estrategia de migración de datos | Documento: export SQLite → script/transform → import Postgres; orden de tablas y FKs definido | L |
| INF-505 | Paridad de esquema | Misma versión de migraciones soporta SQLite (dev) y Postgres (prod) o ramas claras en ORM | L |
| INF-506 | Ventana de corte | Plan: freeze escrituras → dump final SQLite → import → verificación conteos → switch `DATABASE_URL` | M |

**Nota MVP:** la app puede lanzarse en prod solo con PostgreSQL; la migración desde SQLite aplica si hubo datos en dev/dispositivos que deban conservarse.

---

## CI/CD (opcional MVP, recomendado)

| ID | Tarea | Criterios de aceptación | Est. |
|----|-------|-------------------------|------|
| INF-601 | Pipeline build imágenes | GitHub Actions (o similar) construye y publica imágenes en registry | M |
| INF-602 | Deploy por tag | Despliegue manual o SSH con imagen versionada; sin `latest` en prod sin acuerdo | S |

---

## Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Divergencia SQLite vs PostgreSQL (tipos, fechas, constraints) | Bugs solo en prod | Tests de integración contra Postgres en CI; evitar SQL raw no portable |
| Secretos en repo o en imagen | Compromiso total | Solo `.env` en servidor; secrets en GitHub Environments si hay CI |
| Certificado TLS expirado | Caída HTTPS | Cron certbot + alerta 30 días antes |
| Volumen Postgres corrupto o borrado | Pérdida de datos | Backups automáticos + prueba de restore trimestral |
| Exponer puerto 5432 al host | Acceso no autorizado | Red `horario-internal`; bind solo en bridge Docker |
| PWA cachea API antigua tras deploy | Usuarios con datos inconsistentes | Versionado de assets; `Cache-Control` en `index.html` |
| Single VPS sin HA | Downtime en fallo hardware | Aceptado en MVP; documentar RTO/RPO realistas |
| Migración SQLite→Postgres incompleta | Pérdida parcial de jornadas | Dry-run en staging; checklist de conteos fila a fila |

---

## Preguntas abiertas

1. **Nginx en host o en contenedor:** ¿Certbot en host con volúmenes montados o contenedor dedicado con labels?
2. **Registry de imágenes:** ¿GHCR, Docker Hub privado, o build en el VPS vía `git pull`?
3. **Dominio y subdominios:** ¿Un solo FQDN (`app.dominio.com`) o API en subdominio separado?
4. **ORM / migraciones:** ¿Prisma, Drizzle, Knex, Alembic? Define cómo se ejecutan en entrypoint del contenedor.
5. **Autenticación:** ¿JWT stateless, sesiones en DB, OAuth futuro? Afecta variables y cookies (`Secure`, `SameSite`).
6. **Almacenamiento de backups:** ¿Proveedor S3, Backblaze, otro VPS, o solo disco local del VPS (riesgo)?
7. **Entorno staging:** ¿Segundo VPS, o mismo VPS con compose profile `staging`?
8. **Límites de recursos VPS:** RAM/CPU mínimos para Postgres + Node — dimensionar antes de contratar.

---

## Orden sugerido de ejecución

1. Fase 0 → Fase 1 (dev local SQLite)
2. Fase 2 (Compose dev, luego prod con Postgres)
3. Fase 3 (Nginx + TLS en entorno de prueba)
4. Fase 4 (VPS producción + checklist)
5. Fase 5 (backups en prod; migración SQLite solo si aplica)
6. CI/CD (INF-6xx) en paralelo cuando existan Dockerfiles estables

---

## Referencias internas

- README del producto: alcance PWA y uso móvil.
- Pliegos hermanos (si existen): backend (`01-*`), frontend (`02-*`).

*Documento vivo — revisar tras elegir stack backend y herramienta de migraciones.*
