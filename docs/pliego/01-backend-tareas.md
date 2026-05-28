# HorarioPro — Pliego de tareas backend (MVP)

Documento de desglose para implementación del API REST con **FastAPI**, **SQLAlchemy**, **SQLite** (desarrollo) y camino a **PostgreSQL** (producción). Referencia: pliego funcional *Aplicación de Control de Horas* (HorarioPro).

**Principios:** capas claras (routers → services → models), validación en frontera (schemas Pydantic), sin sobreingeniería, un solo usuario en MVP pero modelo preparado para `user_id` en todas las entidades.

---

## Modelo de datos (referencia MVP)

| Tabla | Campos (pliego) | Notas de implementación |
|-------|-----------------|-------------------------|
| `users` | `id`, `email`, `password_hash`, `created_at` | Sin registro público en MVP; usuario semilla vía script/CLI |
| `clients` | `id`, `user_id`, `name`, `color`, `hourly_rate`, `created_at` | `hourly_rate` nullable; `color` hex o nombre corto |
| `shifts` | `id`, `user_id`, `client_id`, `start_time`, `end_time`, `break_minutes`, `driving_extra`, `notes`, `created_at` | `start_time`/`end_time` como `datetime` (timezone UTC recomendado) |

**Relaciones:** `clients.user_id` → `users.id`; `shifts.client_id` → `clients.id`; `shifts.user_id` → `users.id`. Borrado de cliente con jornadas: definir política (ver preguntas abiertas).

---

## Endpoints API previstos (MVP)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/health` | No | Liveness para Docker/monitorización |
| `POST` | `/api/v1/auth/login` | No | Email + password → JWT |
| `GET` | `/api/v1/auth/me` | JWT | Usuario autenticado |
| `GET` | `/api/v1/clients` | JWT | Listar clientes del usuario |
| `POST` | `/api/v1/clients` | JWT | Crear cliente |
| `GET` | `/api/v1/clients/{id}` | JWT | Detalle cliente |
| `PATCH` | `/api/v1/clients/{id}` | JWT | Actualizar cliente |
| `DELETE` | `/api/v1/clients/{id}` | JWT | Eliminar cliente |
| `GET` | `/api/v1/shifts` | JWT | Listar jornadas (filtros: `from`, `to`, `client_id`) |
| `POST` | `/api/v1/shifts` | JWT | Crear jornada |
| `GET` | `/api/v1/shifts/{id}` | JWT | Detalle jornada |
| `PATCH` | `/api/v1/shifts/{id}` | JWT | Actualizar jornada |
| `DELETE` | `/api/v1/shifts/{id}` | JWT | Eliminar jornada |
| `GET` | `/api/v1/dashboard/summary` | JWT | Agregados: hoy / semana / mes, dinero estimado, extras conducción, últimas N jornadas |

**No incluido en MVP (explícito en pliego):** `POST /auth/register`, OAuth, recuperación de contraseña, exportaciones, webhooks.

**Convención de respuestas:** JSON; errores con códigos HTTP coherentes (`401`, `403`, `404`, `422`); mensajes de validación en español o inglés (decidir una vez y mantener).

---

## Estimaciones

| Código | Significado |
|--------|-------------|
| **S** | ≤ medio día |
| **M** | 1–2 días |
| **L** | 3+ días o varias dependencias críticas |

---

## Fase 0 — Setup y esqueleto del proyecto

### BE-001 | Estructura de carpetas y dependencias

**Descripción:** Crear proyecto Python en `backend/` (o raíz acordada) con `pyproject.toml` o `requirements.txt`, FastAPI, Uvicorn, SQLAlchemy 2.x, Alembic (opcional en MVP pero recomendado), `python-jose` o `PyJWT`, `passlib[bcrypt]`, `pydantic-settings`, `python-multipart`. Estructura:

```
app/
  main.py
  core/          # config, security, deps
  db/            # session, base
  models/
  schemas/
  services/
  routers/
  utils/
```

**Criterios de aceptación:**
- `uvicorn app.main:app --reload` arranca sin error.
- Variables de entorno documentadas en `.env.example` (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `ACCESS_TOKEN_EXPIRE_MINUTES`).
- README backend con comandos de arranque y migración.

**Dependencias:** ninguna.

**Estimación:** S

---

### BE-002 | Configuración y conexión a base de datos

**Descripción:** Módulo `core/config.py` con `Settings` (Pydantic). Factory de engine/session SQLAlchemy. SQLite por defecto (`sqlite:///./horariopro.db`); URL compatible con PostgreSQL vía env sin cambiar código de negocio.

**Criterios de aceptación:**
- Sesión inyectable en dependencias FastAPI (`get_db`).
- `create_all` o migración inicial documentada.
- Sin credenciales hardcodeadas.

**Dependencias:** BE-001.

**Estimación:** S

---

### BE-003 | Modelos SQLAlchemy base

**Descripción:** Definir modelos `User`, `Client`, `Shift` según tabla del pliego. Índices en `email` (único), `clients.user_id`, `shifts.user_id`, `shifts.client_id`, `shifts.start_time` (consultas por rango).

**Criterios de aceptación:**
- Tipos y `nullable` alineados al pliego.
- Relaciones ORM configuradas (`relationship` + `back_populates`).
- Migración Alembic inicial o script de creación reproducible.

**Dependencias:** BE-002.

**Estimación:** M

---

### BE-004 | CORS, middleware y endpoint health

**Descripción:** Configurar `CORSMiddleware` con orígenes desde env (frontend Vite en dev). Endpoint `GET /health` sin auth.

**Criterios de aceptación:**
- Preflight desde origen frontend permitido en desarrollo.
- Respuesta health: `{ "status": "ok" }` (o similar).

**Dependencias:** BE-001.

**Estimación:** S

---

### BE-005 | Manejo global de errores y logging básico

**Descripción:** Handlers para `HTTPException`, errores de validación Pydantic y excepciones no controladas (500 genérico sin filtrar stack en producción). Logs estructurados mínimos en login fallido y errores 5xx.

**Criterios de aceptación:**
- Respuestas de error con forma consistente (`detail`, opcional `code`).
- No exponer trazas internas en respuesta JSON.

**Dependencias:** BE-001.

**Estimación:** S

---

## Fase 1 — Autenticación (JWT)

### BE-010 | Utilidades de seguridad (hash + JWT)

**Descripción:** En `core/security.py`: hash/verify con bcrypt (passlib); crear/decodificar JWT con `sub` = user id, `exp`, algoritmo HS256; dependencia `get_current_user` que lee `Authorization: Bearer`.

**Criterios de aceptación:**
- Contraseñas nunca persistidas en claro.
- Token inválido o expirado → `401`.
- Secret desde variable de entorno obligatoria en arranque.

**Dependencias:** BE-003.

**Estimación:** M

---

### BE-011 | Schemas y servicio de autenticación

**Descripción:** Schemas `LoginRequest`, `TokenResponse`, `UserRead`. Servicio `auth_service.login(email, password)` que valida credenciales y devuelve token + datos usuario mínimos.

**Criterios de aceptación:**
- Email normalizado (lowercase trim).
- Login incorrecto → `401` con mensaje genérico (no revelar si existe email).
- Validación Pydantic de email y password no vacío.

**Dependencias:** BE-010.

**Estimación:** S

---

### BE-012 | Router auth: login y me

**Descripción:** `POST /api/v1/auth/login`, `GET /api/v1/auth/me` protegido.

**Criterios de aceptación:**
- Login devuelve `access_token`, `token_type: bearer`, y opcionalmente usuario.
- `/me` devuelve `id`, `email`, `created_at` sin `password_hash`.
- Rutas bajo prefijo `/api/v1`.

**Dependencias:** BE-011, BE-004.

**Estimación:** S

---

### BE-013 | Usuario semilla (bootstrap)

**Descripción:** Comando CLI o script `create_user --email --password` para el único usuario MVP (sin endpoint público de registro).

**Criterios de aceptación:**
- Idempotencia documentada (falla si email existe o actualiza según decisión documentada).
- Instrucciones en README para primer arranque.

**Dependencias:** BE-003, BE-010.

**Estimación:** S

---

## Fase 2 — CRUD clientes

### BE-020 | Schemas Pydantic de cliente

**Descripción:** `ClientCreate`, `ClientUpdate`, `ClientRead`. Validar `name` (longitud mínima), `color` (hex `#RRGGBB` o lista cerrada), `hourly_rate` opcional ≥ 0.

**Criterios de aceptación:**
- `hourly_rate` acepta `null` y decimales con precisión definida (p. ej. 2 decimales).
- Respuestas serializan fechas en ISO 8601.

**Dependencias:** BE-003.

**Estimación:** S

---

### BE-021 | Servicio de clientes

**Descripción:** `client_service` con list/create/get/update/delete filtrando siempre por `user_id` del token.

**Criterios de aceptación:**
- No se puede acceder a cliente de otro usuario (`404` o `403` — elegir y documentar).
- Delete: aplicar política acordada (bloquear si hay shifts vs cascade — ver riesgos).

**Dependencias:** BE-020, BE-010.

**Estimación:** M

---

### BE-022 | Router CRUD `/clients`

**Descripción:** Implementar endpoints listados en tabla API para clientes.

**Criterios de aceptación:**
- Todos los endpoints requieren JWT.
- `422` en body inválido.
- Listado ordenado por `name` o `created_at` (documentar).

**Dependencias:** BE-021, BE-012.

**Estimación:** S

---

## Fase 3 — CRUD jornadas (shifts)

### BE-030 | Schemas Pydantic de jornada

**Descripción:** `ShiftCreate`, `ShiftUpdate`, `ShiftRead`. Campos obligatorios: `client_id`, `start_time`, `end_time`. Opcionales: `break_minutes` (default 0), `driving_extra` (default 0 o null), `notes`.

**Criterios de aceptación:**
- Validación: `end_time` > `start_time`.
- `break_minutes` ≥ 0 y menor que duración total.
- `client_id` debe pertenecer al mismo `user_id`.
- `driving_extra` ≥ 0 (importe monetario según pliego; ver preguntas).

**Dependencias:** BE-020, BE-003.

**Estimación:** M

---

### BE-031 | Servicio de jornadas

**Descripción:** CRUD con filtros en listado: `from_date`, `to_date`, `client_id`, paginación simple (`limit`/`offset` o cursor — mantener simple).

**Criterios de aceptación:**
- Crear/editar asigna `user_id` desde token, no desde body.
- Filtro por rango usa `start_time` (o fecha local acordada — documentar TZ).
- Eliminar jornada es idempotente (`404` si no existe).

**Dependencias:** BE-030, BE-021.

**Estimación:** M

---

### BE-032 | Router CRUD `/shifts`

**Descripción:** Endpoints REST para jornadas según tabla API.

**Criterios de aceptación:**
- Listado soporta query params documentados en OpenAPI.
- Respuesta de detalle incluye datos calculados opcionales (`worked_minutes`, `estimated_amount`) o solo en summary — decidir en BE-040.

**Dependencias:** BE-031, BE-012.

**Estimación:** M

---

## Fase 4 — Cálculos y dashboard

### BE-040 | Utilidades de cálculo

**Descripción:** Módulo `utils/calculations.py` (o `services/calculations.py`):

- **Horas trabajadas:** `(end_time - start_time) - break_minutes` → horas decimales o minutos.
- **Importe jornada:** `horas * tarifa` donde tarifa = `client.hourly_rate` si existe; si no, `0` o `null` en estimación (documentar).
- **Extra conducción:** campo `driving_extra` sumado al total estimado de la jornada.

**Criterios de aceptación:**
- Funciones puras, testeables, sin acceso a DB.
- Casos borde: jornada sin tarifa horaria → dinero estimado 0 o omitido en UI vía flag.
- Redondeo monetario consistente (2 decimales, half-up).

**Dependencias:** BE-030.

**Estimación:** M

---

### BE-041 | Servicio de agregados dashboard

**Descripción:** `dashboard_service.get_summary(user_id, timezone?)` calculando:

- Horas hoy / semana actual / mes actual (calendario local o UTC — fijar criterio).
- Dinero estimado en cada periodo (suma de jornadas con tarifa).
- Total extras conducción en periodo.
- Últimas N jornadas (p. ej. 5–10) con cliente embebido o `client_name`.

**Criterios de aceptación:**
- Consultas eficientes (agregación en SQL donde sea razonable).
- Semana: lunes inicio (España) salvo decisión contraria documentada.
- Respuesta estable para contrato frontend.

**Dependencias:** BE-040, BE-031.

**Estimación:** M

---

### BE-042 | Router `GET /dashboard/summary`

**Descripción:** Endpoint único para vista Dashboard del frontend.

**Criterios de aceptación:**
- Schema `DashboardSummary` documentado en OpenAPI.
- Solo usuario autenticado.
- Parámetro opcional `recent_limit` con máximo capado (p. ej. 20).

**Dependencias:** BE-041, BE-012.

**Estimación:** S

---

### BE-043 | Campos calculados en respuestas de shift (opcional recomendado)

**Descripción:** En `ShiftRead`, incluir `worked_hours`, `estimated_pay` calculados en servicio al leer/listar.

**Criterios de aceptación:**
- Misma lógica que BE-040 (sin duplicar fórmulas en router).
- Historial frontend puede mostrar totales sin recalcular.

**Dependencias:** BE-040, BE-032.

**Estimación:** S

---

## Fase 5 — Calidad, documentación y preparación producción

### BE-050 | OpenAPI y versionado API

**Descripción:** Tags por dominio (auth, clients, shifts, dashboard). Descripción en español en docstrings. Prefijo `/api/v1` centralizado.

**Criterios de aceptación:**
- `/docs` usable para desarrollo frontend.
- Ejemplos de request/response en schemas donde ayude.

**Dependencias:** BE-022, BE-032, BE-042.

**Estimación:** S

---

### BE-051 | Compatibilidad PostgreSQL (smoke)

**Descripción:** Verificar que `DATABASE_URL` PostgreSQL funciona con mismos modelos (tipos `Numeric` para dinero, `DateTime(timezone=True)`). Sin despliegue: prueba local o CI con contenedor opcional.

**Criterios de aceptación:**
- Documentar diferencias SQLite vs Postgres (JSON, enums si se usan).
- Sin SQL específico de SQLite en servicios salvo pragmas aislados.

**Dependencias:** BE-003.

**Estimación:** M

---

### BE-052 | Tests opcionales (recomendado mínimo)

**Descripción:** Pytest + `httpx.AsyncClient` o `TestClient`: tests de auth, un flujo cliente → jornada → summary, validaciones 422.

**Criterios de aceptación:**
- BD de test en SQLite en memoria o archivo temporal.
- CI local documentado (`pytest`).
- Cobertura no exigida en MVP; foco en regresiones críticas.

**Dependencias:** BE-042.

**Estimación:** M

---

### BE-053 | Dockerfile backend (coordinación infra)

**Descripción:** `Dockerfile` multi-stage ligero, usuario no root, variable `DATABASE_URL` para compose. Alineado con tareas de `03-infra-tareas.md`.

**Criterios de aceptación:**
- Imagen arranca y responde `/health`.
- Migraciones o init documentado en entrypoint.

**Dependencias:** BE-002, BE-004.

**Estimación:** S

---

## Diagrama de dependencias entre fases

```mermaid
flowchart LR
  F0[Fase 0 Setup] --> F1[Fase 1 Auth]
  F1 --> F2[Fase 2 Clientes]
  F2 --> F3[Fase 3 Jornadas]
  F3 --> F4[Fase 4 Cálculos]
  F4 --> F5[Fase 5 Calidad]
```

---

## Orden de implementación sugerido

1. BE-001 → BE-005 (paralelizable parcialmente)
2. BE-003, BE-010 → BE-013
3. BE-020 → BE-022
4. BE-030 → BE-032
5. BE-040 → BE-043
6. BE-050 → BE-053

---

## Preguntas abiertas

| # | Tema | Opciones / impacto |
|---|------|-------------------|
| Q1 | **Zona horaria** para “hoy / semana / mes” | UTC en BD vs `Europe/Madrid` en agregados; afecta dashboard y filtros |
| Q2 | **`driving_extra`** | ¿Importe fijo en € por jornada (pliego) vs boolean “conducción” + importe separado en UI? Backend puede almacenar solo número |
| Q3 | **Borrado de cliente** con jornadas existentes | RESTRICT (409), SET NULL en `client_id`, o CASCADE delete jornadas |
| Q4 | **Jornada sin `hourly_rate` en cliente** | Mostrar horas pero dinero `null` vs 0 en summary |
| Q5 | **Registro público** | Pliego: no en MVP; ¿endpoint admin interno suficiente con BE-013? |
| Q6 | **Refresh token** | MVP solo access token largo vs refresh + rotación |
| Q7 | **Paginación historial** | Offset simple vs cursor; volumen esperado bajo en uso personal |
| Q8 | **Idioma mensajes de error** | Español único vs inglés para logs y español para `detail` |
| Q9 | **Fecha implícita en jornada** | ¿Solo `datetime` en start/end o campo `work_date` derivado para filtros? |
| Q10 | **Límite de notas / nombre cliente** | Longitudes máximas para evitar abusos |

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cálculos de periodo incorrectos por TZ | Media | Alto | Fijar TZ en config; tests con fechas límite (viernes 23:59) |
| SQLite en producción por error | Media | Alto | Infra fuerza Postgres en prod; validar `DATABASE_URL` en startup |
| Filtración de datos entre usuarios (futuro multiusuario) | Baja en MVP | Alto | Siempre filtrar por `user_id` en servicios, nunca confiar en body |
| JWT robado en XSS frontend | Media | Medio | HTTPS, expiración corta, almacenamiento seguro en PWA (coord. frontend) |
| Duplicar lógica de cálculo en frontend | Media | Medio | BE-043 + contrato único en `DashboardSummary` |
| Alembic omitido y esquema drift | Media | Medio | Migración inicial obligatoria antes de prod |
| `SECRET_KEY` débil o por defecto | Media | Alto | Fallar arranque si valor por defecto en entorno no-dev |

---

## Criterios de “MVP backend listo”

- [ ] Usuario puede autenticarse y llamar API con JWT.
- [ ] CRUD completo de clientes y jornadas con validación y aislamiento por usuario.
- [ ] Dashboard summary devuelve horas y estimaciones alineadas con pliego.
- [ ] OpenAPI disponible; CORS configurado para frontend.
- [ ] SQLite en dev; documentación para Postgres sin cambios de código de negocio.
- [ ] Sin registro público; usuario creado por script bootstrap.

---

## Referencias cruzadas

- Frontend: `docs/pliego/02-frontend-tareas.md` (consumo de estos endpoints).
- Infra: `docs/pliego/03-infra-tareas.md` (Docker, Postgres, Nginx, HTTPS).

*Última actualización: generado para arranque del repositorio HorarioPro.*
