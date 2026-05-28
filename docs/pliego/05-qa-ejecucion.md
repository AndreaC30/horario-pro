# HorarioPro — Registro de ejecución QA

```
Release: pre-v0.1.0-mvp
Fecha: 2026-05-28
Ejecutor: agente + script automatizado
Entorno: dev (Docker Compose, SQLite)
Commit: (working tree local)
```

## Automatizado — `make qa-api` (53/53 PASS)

Comando: `python3 scripts/qa_api_smoke.py` contra `http://localhost:8000`  
Credenciales: `BOOTSTRAP_USER_EMAIL` / `BOOTSTRAP_USER_PASSWORD` en `.env`

| Bloque | IDs cubiertos por script |
|--------|--------------------------|
| Infra API | INF-02 |
| Auth | AUTH-01–04, 07–08, 10 |
| Seguridad API | SEC-01–02, 04–05, 07–08 |
| Clientes | CLI-01–10, 12 |
| Jornadas | SH-01–11, 13–14 |
| Cálculos | CAL-01–07, 13–14 |
| Filtros API | FIL-02 |
| Edge | EDGE-01–05, 08 |

### Corrección aplicada durante QA

- **SEC-07 / validación 422:** los errores Pydantic devolvían **500** porque `exc.errors()` no era JSON-serializable. Corregido en `backend/app/core/exceptions.py` (`jsonable_encoder` + handler `ValidationError`).

### Cálculo CAL-06 (nota)

Jornada de prueba: 7 h netas (8 h − 60 min descanso) × 15 € + 20 € conducción = **125 €** (no 140 € del ejemplo del checklist con 8 h brutas).

---

## Verificado manualmente en entorno dev

| ID | Resultado | Notas |
|----|-----------|-------|
| INF-01 | ☑ | `docker compose up` — backend healthy, frontend Up |
| INF-04 | ☑ | `npm run build` — `sw.js` + `manifest.webmanifest` |
| INF-05 | ☑ | Bootstrap vía `.env` + arranque Docker |
| AUTH-09 | ☑ | `password_hash` con prefijo `$2b$12$` (bcrypt) |
| SEC-11 | ☑ | `.env` en `.gitignore`, no versionado |

---

## Pendiente manual (antes de release diario / prod)

| ID | Motivo |
|----|--------|
| AUTH-05 | Persistencia JWT: cerrar pestaña y reabrir en navegador |
| AUTH-06 | Logout UI → redirección login |
| SH-12 | Diálogo confirmación borrado en Historial |
| FIL-01, FIL-03, FIL-05–06 | UI Historial / orden / vacío / edición |
| UXM-01–04 | Cronómetro flujo feliz, 375–430px, onboarding sin clientes |
| SEC-06 | HTTPS redirect en VPS (`workshift.andreacruz.es`) |
| SEC-09 | XSS en UI: notas con `<script>` no deben ejecutarse |
| SEC-10 | Rate limit login (deuda MVP si no implementado) |
| SEC-12 | Headers Nginx prod (bloque en `deploy/nginx-proxy/`) |
| INF-03 | Instalar PWA en móvil real (icono HorarioPro) |
| CLI-11 | Segundo usuario: `docker compose exec horario-backend python -m app.cli create-user --email qa-b@example.com --password '...'` |
| CAL-08–10 | Agregados hoy/semana/mes vs calendario real |
| 10.1 Smoke crítico UI | Recorrido completo en http://localhost:8080 |

### Comando útil segundo usuario (CLI-11)

```bash
docker compose exec horario-backend python -m app.cli create-user \
  --email qa-b@example.com --password 'cambiar-password-qa'
```

---

## Criterio de salida (§10.4)

| Criterio | Estado |
|----------|--------|
| 0 defectos P0 API abiertos | ☑ (smoke API) |
| P0 UI / prod | Pendiente filas «manual» arriba |
| README bootstrap | ☑ |

**Siguiente paso:** completar tabla «Pendiente manual» y marcar ☑ en [05-qa-checklist.md](./05-qa-checklist.md).
