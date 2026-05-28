# HorarioPro — Registro de ejecución QA

```
Release: pre-v0.1.0-mvp
Fecha: 2026-05-28
Ejecutor: automatizado (scripts + Playwright)
Entorno: dev (Docker Compose, SQLite)
App: http://localhost:8080 · API: http://localhost:8000
```

## Comandos

```bash
docker compose up -d --build
make qa-api    # 68/68 PASS — scripts/qa_api_smoke.py
make qa-e2e    # 6/6 PASS — frontend/e2e/smoke.spec.ts
make qa        # ambos
```

Primera vez E2E: `cd frontend && PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium`

---

## Resultado global

| Capa | Resultado |
|------|-----------|
| API smoke | **68/68 PASS** |
| E2E UI (móvil emulado) | **6/6 PASS** |
| P0 API | ☑ Cerrado |
| P0 UI automatizable | ☑ Cerrado |
| Release diario / prod | Ver notas abajo |

---

## API (`make qa-api`)

Cubre: AUTH, SEC (API), CLI, SH, CAL, FIL (API), EDGE, INF-02/03 (manifest), SEC-12 (plantilla nginx), CLI-11, CAL-08–10, SEC-10 (deuda documentada), SEC-06 (omitido en dev sin `APP_BASE_URL` https).

Corrección aplicada en QA: validación Pydantic → **422** (antes 500) en `backend/app/core/exceptions.py`.

---

## E2E UI (`make qa-e2e`)

| Test | Casos QA |
|------|----------|
| AUTH-01/06 login y logout | AUTH-01, AUTH-06, §10.1 |
| AUTH-05 persistencia token tras recarga | AUTH-05 |
| UXM-02 CTA visible | UXM-02 |
| FIL-01/SH-12 historial y modal eliminar | FIL-01, SH-12, FIL-03 (presets) |
| SEC-09 XSS en notas | SEC-09 |
| UXM-03 sin scroll horizontal | UXM-03 |

---

## Verificado en entorno dev (no script)

| ID | Estado |
|----|--------|
| INF-01 | ☑ Docker compose healthy |
| INF-04 | ☑ `npm run build` + PWA assets |
| INF-05 | ☑ Bootstrap `.env` |
| AUTH-09 | ☑ bcrypt en DB |
| SEC-11 | ☑ `.env` ignorado por git |
| UXM-04 | ☑ Empty state sin clientes (código + ShiftFormPage) |

---

## Pendiente solo en prod / opcional

| ID | Acción |
|----|--------|
| SEC-06 | Tras desplegar: `APP_BASE_URL=https://workshift.andreacruz.es make smoke-https` o curl http→https |
| SEC-10 | Activar rate limit en nginx-proxy (snippet en `deploy/nginx-proxy/`) — P2 |
| UXM-01 | Medición manual <10 s / ≤5 acciones (5 intentos con cronómetro) — recomendado, no bloqueante si API+E2E OK |
| INF-03 (móvil físico) | «Añadir a pantalla de inicio» en iPhone/Android con build desplegado — manifest ya validado por URL |

---

## Criterio de salida §10.4

| Criterio | Estado |
|----------|--------|
| 0 defectos P0 API abiertos | ☑ |
| 0 defectos P0 UI (automatizado) | ☑ |
| P0 prod (HTTPS) | Al desplegar VPS |
| README bootstrap | ☑ |

**MVP listo para uso diario en dev y para despliegue en VPS** tras smoke HTTPS en producción.
