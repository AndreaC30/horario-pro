# HorarioPro — Checklist QA (MVP)

Lista de verificación para pruebas manuales y smoke automatizable del MVP. Complementa [04-ux-criterios.md](./04-ux-criterios.md).

**Alcance:** Login, Dashboard, CRUD jornadas (`shifts`), CRUD clientes (`clients`), cálculos, filtros, despliegue básico.  
**Entornos:** dev (SQLite) obligatorio; staging/prod (PostgreSQL + HTTPS) antes de uso diario real.

> **Ejecución 2026-05-28:** smoke API `make qa-api` → **53/53 PASS**. Detalle y pendientes UI/prod en [05-qa-ejecucion.md](./05-qa-ejecucion.md).

**Convenciones**

| Columna | Significado |
|---------|-------------|
| **ID** | Identificador del caso |
| **P** | Prioridad: P0 bloqueante release, P1 alta, P2 media |
| **☐** | Pendiente / **☑** | Ejecutado OK |

**Datos de prueba sugeridos**

- Usuario: `qa@horariopro.test` (creado vía seed/CLI).
- Cliente A: tarifa 15 €/h, color `#2563eb`.
- Cliente B: sin tarifa (`hourly_rate` null).
- Cliente C: tarifa 0 €/h (edge).
- Jornadas de referencia con horas conocidas (ver sección Cálculos).

**Contrato de cálculo (referencia QA)**

```
horas_netas = max(0, (end_time - start_time) en minutos - break_minutes) / 60
importe = horas_netas * hourly_rate   (si hourly_rate es null → sin importe en €)
total_jornada = importe + driving_extra   (driving_extra numérico ≥ 0, default 0)
```

Agregados Dashboard: suma de jornadas del periodo (hoy / semana ISO / mes calendario) según TZ acordada (MVP: local navegador = servidor).

---

## 1. Autenticación (auth)

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | AUTH-01 | Login correcto | POST credenciales válidas / UI Entrar | 200 + JWT; redirección Dashboard; token almacenado | P0 |
| ☐ | AUTH-02 | Login incorrecto | Password errónea | 401; mensaje genérico; sin JWT | P0 |
| ☐ | AUTH-03 | Email inexistente | Email no registrado | Mismo mensaje que AUTH-02 (no enumerar usuarios) | P0 |
| ☐ | AUTH-04 | Campos vacíos | Submit sin email o password | 422 UI + backend; no 500 | P0 |
| ☐ | AUTH-05 | Persistencia sesión | Login → cerrar pestaña → reabrir | Sigue autenticado dentro de TTL | P0 |
| ☐ | AUTH-06 | Logout | Logout desde app | Token eliminado; rutas protegidas redirigen a Login | P0 |
| ☐ | AUTH-07 | Ruta protegida sin token | GET `/shifts` sin Authorization | 401 | P0 |
| ☐ | AUTH-08 | Token expirado/malformado | Bearer inválido | 401; UI pide login | P0 |
| ☐ | AUTH-09 | Password hashing | Inspeccionar DB | `password_hash` ≠ plaintext; algoritmo seguro (bcrypt/argon2) | P0 |
| ☐ | AUTH-10 | No registro público | Buscar endpoint/UI registro | No existe en MVP | P1 |

---

## 2. Clientes — CRUD

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | CLI-01 | Crear cliente mínimo | Solo nombre | 201; aparece en listado | P0 |
| ☐ | CLI-02 | Crear con color y tarifa | name + color + hourly_rate | Valores persistidos; color visible en UI | P0 |
| ☐ | CLI-03 | Editar nombre/tarifa | PATCH cliente A | Cambios en listado y en jornadas futuras | P0 |
| ☐ | CLI-04 | Nombre duplicado | Dos clientes mismo nombre | Permitido o rechazado según decisión; comportamiento documentado | P2 |
| ☐ | CLI-05 | Nombre vacío | POST sin name | 422 | P0 |
| ☐ | CLI-06 | Tarifa negativa | hourly_rate = -10 | 422 | P0 |
| ☐ | CLI-07 | Tarifa cero | hourly_rate = 0 | Guardado; cálculo importe = 0; UI «sin importe» o 0 € explícito | P1 |
| ☐ | CLI-08 | Tarifa null | Sin hourly_rate | Jornadas muestran horas; no € inventado | P0 |
| ☐ | CLI-09 | Eliminar sin jornadas | DELETE cliente sin shifts | 204; desaparece del listado | P0 |
| ☐ | CLI-10 | Eliminar con jornadas | DELETE cliente con shifts asociados | **Política definida:** 409 bloqueo **o** cascade documentado; UI mensaje claro | P0 |
| ☐ | CLI-11 | Aislamiento usuario | User B intenta GET/DELETE cliente de User A | 404 o 403 | P0 |
| ☐ | CLI-12 | Color inválido | color = "foo" | 422 o normalización | P2 |

---

## 3. Jornadas (shifts) — CRUD

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | SH-01 | Crear jornada mínima | client_id + start + end | 201; aparece Dashboard e Historial | P0 |
| ☐ | SH-02 | Crear con descanso | break_minutes = 30 | Horas netas reducidas 30 min | P0 |
| ☐ | SH-03 | Crear con notas | notes texto largo | Persistido; visible en detalle/edición | P1 |
| ☐ | SH-04 | driving_extra | Importe 25 + toggle conducción si aplica UI | Suma en total jornada y agregados | P0 |
| ☐ | SH-05 | driving_extra = 0 / null | Sin extra | No suma fantasma | P1 |
| ☐ | SH-06 | end ≤ start mismo día | 09:00–08:00 mismo día | 422 con mensaje claro | P0 |
| ☐ | SH-07 | break negativo | break_minutes = -5 | 422 | P0 |
| ☐ | SH-08 | Sin client_id | Omitir cliente | 422 | P0 |
| ☐ | SH-09 | client_id ajeno | Cliente de otro user | 404/403 | P0 |
| ☐ | SH-10 | Editar jornada | PATCH horas y cliente | Totales recalculados; Dashboard actualizado | P0 |
| ☐ | SH-11 | Eliminar jornada | DELETE | 204; desaparece listados; totales decrementan | P0 |
| ☐ | SH-12 | Confirmación UI borrado | Eliminar desde Historial | Diálogo confirmación (UX-H05) | P1 |
| ☐ | SH-13 | Lista paginada/filtro | GET con `date_from`, `date_to` | Solo jornadas en rango | P0 |
| ☐ | SH-14 | Filtro por client_id | Query `client_id` | Solo jornadas de ese cliente | P1 |

---

## 4. Cálculos y Dashboard

| ☐ | ID | Caso | Datos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | CAL-01 | Horas simples | 08:00–16:00, break 0 | 8.0 h netas | P0 |
| ☐ | CAL-02 | Con descanso | 08:00–16:00, break 60 | 7.0 h netas | P0 |
| ☐ | CAL-03 | Importe con tarifa | 8 h × 15 € | 120 € en jornada + agregados | P0 |
| ☐ | CAL-04 | Sin tarifa | Cliente B, 8 h | Horas sí; importe omitido o «—» | P0 |
| ☐ | CAL-05 | Tarifa cero | Cliente C, 8 h | 0 € explícito, no error | P1 |
| ☐ | CAL-06 | Extra conducción | driving_extra = 20, 8 h × 15 € | Total jornada 140 € (si política suma a jornada) | P0 |
| ☐ | CAL-07 | Suma extras periodo | Varias jornadas con driving_extra | Dashboard «extras conducción» = suma correcta | P0 |
| ☐ | CAL-08 | Horas hoy | Jornada con fecha local hoy | Contador «hoy» incluye solo hoy | P0 |
| ☐ | CAL-09 | Horas semana | Jornadas lun–dom ISO | Coincide con manual | P0 |
| ☐ | CAL-10 | Horas mes | Jornadas mes calendario | Coincide con manual | P0 |
| ☐ | CAL-11 | Dinero estimado periodo | Mezcla clientes A y B | Solo tarifas definidas; sin doble conteo | P0 |
| ☐ | CAL-12 | Últimas jornadas | >5 en DB | Dashboard muestra las N más recientes ordenadas | P1 |
| ☐ | CAL-13 | Coherencia API-UI | Misma jornada en GET shift, Historial, Dashboard | Mismos números (tolerancia redondeo 0.01 €) | P0 |
| ☐ | CAL-14 | Endpoint resumen | GET `/dashboard/summary` o equivalente | Igual que agregación UI | P1 |

---

## 5. Filtros e Historial (UI + API)

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | FIL-01 | Listado por defecto | Abrir Historial | Orden descendente por fecha/hora inicio | P0 |
| ☐ | FIL-02 | Rango fechas | Filtrar semana actual | Solo jornadas del rango | P0 |
| ☐ | FIL-03 | Rango sin resultados | Fechas futuras vacías | Estado vacío amigable | P1 |
| ☐ | FIL-04 | date_from > date_to | Query invertido | 422 o resultado vacío documentado | P2 |
| ☐ | FIL-05 | Editar desde historial | Tap fila → guardar | Cambios reflejados en Dashboard | P0 |
| ☐ | FIL-06 | Columnas visibles | Revisar fila | Fecha, cliente, horas, extras, total | P0 |

---

## 6. Casos límite (edge cases)

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | EDGE-01 | **Cruce medianoche** | start 22:00 día D, end 06:00 día D+1 | Política MVP documentada: (a) permitir si end>start en timeline absoluto, o (b) 422; cálculo = 8 h si permitido | P0 |
| ☐ | EDGE-02 | break > duración bruta | 08:00–09:00, break 120 | 422 o horas netas = 0 (no negativas) | P0 |
| ☐ | EDGE-03 | break = 0 omitido | Campo ausente | Tratado como 0 | P1 |
| ☐ | EDGE-04 | Jornada duración 0 | start = end | 422 o 0 h según política | P1 |
| ☐ | EDGE-05 | driving_extra negativo | -5 | 422 | P0 |
| ☐ | EDGE-06 | Notas muy largas | >2000 caracteres | 422 o truncado documentado | P2 |
| ☐ | EDGE-07 | Muchas jornadas | >100 registros | Listado performante; paginación si existe | P2 |
| ☐ | EDGE-08 | Eliminar cliente con shifts | Ver CLI-10 | Sin huérfanos `client_id` inválidos en UI | P0 |
| ☐ | EDGE-09 | Editar tarifa cliente | Cambiar tarifa tras jornadas guardadas | Jornadas pasadas: recalculan o congelan según decisión (documentar; MVP recomendado: recalcular al mostrar) | P1 |
| ☐ | EDGE-10 | Cambio horario verano | Jornada día cambio DST | Sin crash; duración razonable | P2 |
| ☐ | EDGE-11 | Fechas en UTC vs local | Crear 23:30 local | Fecha mostrada coincide con intención usuario | P1 |

---

## 7. UX medible (enlace con 04-ux-criterios)

| ☐ | ID | Caso | Criterio | P |
|---|-----|------|----------|---|
| ☐ | UXM-01 | Registro flujo feliz ×5 | Mediana <10 s, acciones ≤5 | P0 |
| ☐ | UXM-02 | CTA Dashboard móvil 430px | «+ Nueva jornada» sin scroll | P0 |
| ☐ | UXM-03 | Sin scroll horizontal | 5 vistas en 375px | P1 |
| ☐ | UXM-04 | Primera jornada sin clientes | Onboarding / bloqueo claro | P1 |

---

## 8. Seguridad — smoke tests

| ☐ | ID | Caso | Pasos | Resultado esperado | P |
|---|-----|------|-------|-------------------|---|
| ☐ | SEC-01 | JWT obligatorio | API sin header en rutas privadas | 401 | P0 |
| ☐ | SEC-02 | JWT firma inválida | Token manipulado | 401 | P0 |
| ☐ | SEC-03 | JWT de otro usuario | Si se pudiera falsificar payload | No accede a datos ajenos (claims + user_id en DB) | P0 |
| ☐ | SEC-04 | CORS origen permitido | Request desde origen frontend configurado | Access-Control correcto; credenciales si aplica | P0 |
| ☐ | SEC-05 | CORS origen no permitido | Origin `https://evil.example` | Bloqueado o sin ACAO permisivo `*` con credenciales | P0 |
| ☐ | SEC-06 | HTTPS en prod | Acceso http:// dominio prod | Redirección 301 a HTTPS (Nginx) | P0 |
| ☐ | SEC-07 | Validación backend | Bypass UI con curl POST inválido | 422; no 500 por ValidationError no capturado | P0 |
| ☐ | SEC-08 | SQL injection básico | `name=' OR 1=1--` en cliente | Sin error SQL; entrada escapada/ORM | P0 |
| ☐ | SEC-09 | XSS almacenado | notes con `<script>alert(1)</script>` | Escapado al renderizar | P1 |
| ☐ | SEC-10 | Rate limit login | 20 intentos fallidos (si implementado) | Throttle o lockout; si no MVP, documentar deuda | P2 |
| ☐ | SEC-11 | Secretos no en repo | Revisar `.env`, compose | Sin passwords reales en git | P0 |
| ☐ | SEC-12 | Headers seguridad Nginx | Respuesta frontend/API prod | `X-Content-Type-Options`, HSTS si HTTPS (mínimo) | P2 |

---

## 9. Infra y humo de despliegue (MVP)

| ☐ | ID | Caso | Resultado esperado | P |
|---|-----|------|-------------------|---|
| ☐ | INF-01 | `docker compose up` dev | frontend + backend + db healthy | P0 |
| ☐ | INF-02 | Health API | GET `/health` | 200 | P1 |
| ☐ | INF-03 | PWA manifest | Instalar en móvil | Icono y nombre HorarioPro | P1 |
| ☐ | INF-04 | Build frontend prod | `npm run build` / imagen | Sin errores; assets servidos | P0 |
| ☐ | INF-05 | Migración/seed usuario | Script documentado | Login QA posible | P0 |

---

## 10. Regresión MVP — checklist de release

Ejecutar **toda la sección P0** antes de etiquetar release `v0.1.0-mvp` o equivalente.

### 10.1 Smoke crítico (15–30 min)

| ☐ | Flujo |
|---|--------|
| ☐ | Seed usuario → Login |
| ☐ | Crear cliente con tarifa |
| ☐ | Crear jornada flujo feliz (<10 s manual opcional) |
| ☐ | Ver Dashboard actualizado |
| ☐ | Ver Historial → editar → ver cambio |
| ☐ | Filtrar por semana |
| ☐ | Eliminar jornada |
| ☐ | Crear segundo cliente sin tarifa → jornada → sin € |
| ☐ | Logout → no acceso Dashboard |

### 10.2 Regresión funcional completa

| ☐ | Bloque | Mínimo |
|---|--------|--------|
| ☐ | Auth AUTH-01–09 | 9/9 |
| ☐ | Clientes CLI-01–11 | 10/11 (P2 opcional) |
| ☐ | Shifts SH-01–14 | 12/14 |
| ☐ | Cálculos CAL-01–13 | 11/13 |
| ☐ | Edge EDGE-01–05, 08 | 6/6 |
| ☐ | Seguridad SEC-01–09, 11 | 10/10 |
| ☐ | UXM-01–02 | 2/2 |

### 10.3 Regresión visual rápida

| ☐ | Comprobación |
|---|--------------|
| ☐ | 5 vistas sin solapamiento en 375px |
| ☐ | Color cliente legible |
| ☐ | Estados vacíos Login tras logout, Historial sin datos |
| ☐ | Errores de formulario visibles |

### 10.4 Criterio de salida release

- **0 defectos P0 abiertos.**
- **≤2 defectos P1** con workaround documentado y issue creado.
- Evidencia UXM-01 adjunta (opcional pero recomendada).
- README con bootstrap usuario y URL de entorno.

---

## 11. Plantilla de registro de ejecución

```
Release: ___________
Fecha: ___________
Ejecutor: ___________
Entorno: dev / staging / prod
Commit: ___________

P0 totales: ___ / ___
P1 abiertos: ___
Notas:
```

---

## 12. Trazabilidad pliego → pruebas

| Requisito pliego | Casos QA |
|------------------|----------|
| Login email/password, JWT, persistencia | AUTH-01–08 |
| Dashboard resúmenes y últimas jornadas | CAL-07–12, SH-01 |
| CRUD jornadas rápido | SH-01–14, UXM-01 |
| Historial filtrar/editar/eliminar | FIL-01–06, SH-10–12 |
| CRUD clientes | CLI-01–12 |
| Cálculos básicos + conducción | CAL-01–07 |
| Validación backend | SH-06–09, SEC-07 |
| CORS, HTTPS, hash | SEC-04–06, AUTH-09 |
| <10 s, <5 acciones | UXM-01 |

---

## Referencias

- [04-ux-criterios.md](./04-ux-criterios.md)
- [01-backend-tareas.md](./01-backend-tareas.md) — endpoints y validaciones
- [02-frontend-tareas.md](./02-frontend-tareas.md) — vistas y componentes
- [03-infra-tareas.md](./03-infra-tareas.md) — despliegue y entornos
- [MEJORAS-V2.md](../MEJORAS-V2.md)
