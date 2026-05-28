# HorarioPro — Opinión profesional y mejoras para v2

Documento derivado del pliego *Aplicación de Control de Horas* (HorarioPro). Complementa el MVP; no sustituye el alcance de la fase 1.

---

## Valoración general del pliego

**Fortalezas**

- Problema y usuario bien acotados (uso personal, un solo usuario al inicio).
- MVP deliberadamente pequeño: 4 vistas + clientes, alineado con validar uso diario antes de escalar.
- Métrica de producto clara («registrar jornada en &lt;10 s y &lt;5 acciones») — rara en pliegos y muy útil para priorizar UX.
- Stack coherente y habitual (React/Vite, FastAPI, SQLite→PostgreSQL, Docker) sin sobrearquitectura.
- Modelo de datos inicial suficiente para el MVP.
- Sección de estándares de código (simplicidad, capas, no sobreingeniería) reduce riesgo de deuda prematura por “plantillas enterprise”.
- Roadmap en 3 fases y exclusión explícita de control horario legal / nóminas — evita scope creep regulatorio.

**Riesgos / lagunas del pliego actual**

| Área | Observación |
|------|-------------|
| **Cálculos** | No define fórmula de «dinero estimado» ni tratamiento de `driving_extra` (fijo, por km, por hora). Sin esto, dashboard e historial pueden divergir entre frontend y backend. |
| **Clientes en UI** | Gestión de clientes está en alcance funcional pero no como «vista» explícita; puede quedar colgada en ajustes o modal y romper el flujo rápido de jornada. |
| **Zona horaria** | No se menciona; crítico si el usuario cruza medianoche o viaja. |
| **Edición / borrado** | Historial permite editar/eliminar; falta política (confirmación, auditoría mínima, soft delete). |
| **Primer usuario** | Sin registro público: hay que documentar bootstrap (script/seed) del único `user`. |
| **PWA offline** | Se pide PWA pero no alcance offline (cola de sync, conflictos). MVP puede ser «installable» sin offline completo — conviene decirlo por escrito. |
| **Tests y CI** | Calidad de código sí; criterios de aceptación automatizados no. |
| **Accesibilidad** | Mobile first sí; WCAG/contraste/focus no. |
| **Backup** | Producción en VPS + SQLite/Postgres sin política de copias en el pliego. |

**Veredicto:** Pliego **sólido para arrancar un MVP personal** con buena filosofía de producto. Para ejecutar sin sorpresas, conviene cerrar 5–8 decisiones de negocio/técnicas (tabla anterior) antes del primer sprint de cálculos y dashboard.

---

## Mejoras recomendadas antes de codificar (MVP+)

Pequeños añadidos de bajo coste que evitan retrabajo:

1. **Contrato de cálculo** (1 página): horas netas = `(end - start) - break_minutes`; importe = `horas_netas × hourly_rate` (si rate null → mostrar horas sin €); `driving_extra` como importe fijo opcional sumado al total del día/semana según se defina.
2. **Endpoint de resumen** agregado (`GET /dashboard/summary?from=&to=`) para no duplicar lógica en el cliente.
3. **Bootstrap de usuario** documentado en README (`create_user` CLI o migración seed).
4. **Validaciones backend**: `end_time > start_time`, `break_minutes >= 0`, cliente pertenece al `user_id` del JWT.
5. **Índices DB**: `(user_id, start_time)` en `shifts` para historial y filtros por fecha.
6. **Decisión PWA**: Fase 1 = manifest + service worker de caché estática; sync offline = v2/v3.

---

## Ideas para v2 (producto)

Priorizadas por impacto frente a esfuerzo, tras validar uso diario del MVP.

### Registro y velocidad

- **Plantillas de jornada**: último cliente + horario típico en un tap («Repetir ayer» / «Misma franja que martes»).
- **Atajos de tiempo**: chips «8h», «4h», fin = ahora; inicio = ahora − X horas.
- **Widget / acción rápida** (PWA): abrir directamente formulario de nueva jornada.
- **Timer en curso**: jornada abierta con stop (sin geolocalización al principio).

### Visualización y exportación

- Calendario mensual (ya en roadmap fase 2) con código de color por cliente.
- Export PDF/Excel con desglose por cliente y periodo fiscal configurable.
- Gráficos simples: horas por semana, % por cliente, tendencia de extras conducción.

### Clientes y tarifas

- Tarifas diferenciadas (hora normal / festivo / nocturno) — solo si el usuario lo necesita.
- Etiquetas o «tipo de trabajo» además de cliente/lugar.
- Archivar clientes inactivos sin borrar historial.

### Recordatorios y hábitos

- Recordatorio si no hay jornada registrada hoy (local o push en v3).
- Resumen semanal por email (opcional, requiere SMTP).

### Multiusuario / SaaS (cuando toque)

- `organizations`, invitaciones, roles (owner/worker).
- Aislamiento estricto por `tenant_id` en todas las tablas.
- Facturación y límites — fuera de v2 salvo que el objetivo de negocio cambie.

---

## Ideas para v2 (técnico y calidad)

### API y datos

- Migraciones versionadas (Alembic) desde el día 1 aunque se use SQLite en dev.
- Paginación y filtros en `GET /shifts` (`date_from`, `date_to`, `client_id`).
- Campo `updated_at` y opcional `deleted_at` (soft delete) en `shifts` y `clients`.
- Idempotencia en creación (`Idempotency-Key`) si más adelante hay sync offline.
- OpenAPI publicada + tipos generados para el frontend (openapi-typescript).

### Seguridad y cumplimiento

- Refresh tokens rotativos o sesiones con expiración corta + «recordarme» explícito.
- Rate limiting en login.
- Recuperación de contraseña (email) cuando deje de ser solo personal.
- Registro de consentimiento y export/borrado de datos (RGPD light) si hay más usuarios.
- Cabeceras de seguridad en Nginx (CSP, HSTS).

### Frontend

- Modo oscuro sistemático (design tokens).
- Formularios accesibles (labels, errores inline, teclado móvil `inputmode`).
- Estado global mínimo (React Query / TanStack Query) para caché de dashboard e invalidación tras guardar jornada.
- Tests E2E críticos: login → crear jornada → ver en dashboard (Playwright).

### Infra y operaciones

- CI: lint + tests + build imágenes en PR.
- Healthchecks (`/health`, `/ready`) en API y compose.
- Backups automáticos Postgres + prueba de restore documentada.
- Staging con misma compose que producción.

### Observabilidad

- Logs estructurados (request_id, user_id).
- Métricas básicas (latencia, 5xx) si el VPS lo permite — sin Kubernetes.

---

## Matriz rápida: qué NO meter en v2 sin validación

| Funcionalidad | Motivo |
|---------------|--------|
| Geolocalización automática | Privacidad, batería, precisión; el pliego ya la deja para fase 3. |
| Microservicios / K8s | Correctamente excluido; mantener monolito modular. |
| Certificación control horario | Ámbito legal distinto al producto actual. |
| IA / categorización automática | No resuelve el dolor principal (registro rápido). |

---

## Criterios de éxito sugeridos post-MVP (para decidir v2)

- ≥ N jornadas registradas por semana durante 4 semanas seguidas.
- Mediana de tiempo de registro &lt; 15 s en uso real (telemetría simple o encuesta).
- Usuario exporta o consulta historial al menos 1 vez por mes (necesidad de reporting).
- Petición explícita de: calendario, export, timer o segundo usuario.

---

## Referencia

- Pliego fuente: *Aplicación de Control de Horas* (HorarioPro).
- Desglose de tareas de implementación: `docs/pliego/`.
