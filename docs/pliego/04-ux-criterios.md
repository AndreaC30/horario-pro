# HorarioPro — Criterios UX de aceptación (MVP)

Documento de aceptación de experiencia de usuario por vista. Complementa el pliego *Aplicación de Control de Horas* y el desglose técnico (`01`–`03`). Idioma de referencia: español (UI).

**Principio rector del producto:** registrar una jornada completa en **menos de 10 segundos** y **menos de 5 acciones** (tap/clic que avanza el flujo; no contar scroll pasivo ni teclas de navegación del sistema).

**Definiciones medibles**

| Término | Defición |
|---------|----------|
| **Acción** | Tap/clic que cambia pantalla, abre/cierra control, selecciona valor o envía formulario. Escribir en un campo cuenta como 1 acción al salir del campo (blur) o al confirmar, no por cada tecla. |
| **Registro completo** | Jornada guardada con cliente, hora inicio y hora fin válidos; resto opcional. |
| **Usuario de prueba UX** | Persona que ya tiene ≥1 cliente creado y sesión iniciada; dispositivo móvil (viewport ≤430px) en red normal. |
| **Flujo feliz estándar** | Dashboard → «+ Nueva jornada» → cliente por defecto o último usado → horas con valores por defecto razonables → Guardar. |

**Contrato visual de cálculo (coherencia UX)** — alineado con decisión MVP+ del pliego:

- Horas netas = `(end_time − start_time) − break_minutes`.
- Importe estimado = `horas_netas × hourly_rate` si el cliente tiene tarifa; si `hourly_rate` es null/0, mostrar horas sin símbolo € o con etiqueta «sin tarifa».
- `driving_extra`: importe fijo opcional sumado al total del día/semana según defina el backend (mismo criterio en Dashboard e Historial).

---

## 1. Criterios transversales (todas las vistas)

| ID | Criterio | Cómo verificar | Prioridad |
|----|----------|----------------|-----------|
| UX-G01 | **Mobile first**: contenido usable sin zoom horizontal en 320–430px | Inspección en DevTools + prueba en dispositivo real | Bloqueante |
| UX-G02 | **Áreas táctiles** ≥44×44px en controles principales | Medición en inspector / regla de diseño | Bloqueante |
| UX-G03 | **Máximo 1 acción primaria** por pantalla (CTA dominante) | Revisión visual; no competir «Guardar» con otro botón del mismo peso | Alta |
| UX-G04 | **Jerarquía tipográfica**: título → dato clave → secundario | Sin más de 3 niveles de énfasis por bloque | Alta |
| UX-G05 | **Feedback inmediato** tras guardar/error (<300ms perceived) | Spinner o estado deshabilitado en submit; toast o mensaje inline | Alta |
| UX-G06 | **Errores en lenguaje humano**, junto al campo | No solo toast genérico para validación de formulario | Alta |
| UX-G07 | **Navegación ≤2 niveles** desde Dashboard a cualquier tarea MVP | Mapa de rutas documentado | Alta |
| UX-G08 | **Contraste legible** en texto principal y botones (WCAG AA objetivo) | Herramienta de contraste en color de cliente + fondo | Media |
| UX-G09 | **Teclado móvil adecuado** (`inputmode`, `type` en horas/números) | Prueba iOS/Android | Media |
| UX-G10 | **Sin registro público** en MVP: no enlaces «Crear cuenta» | Revisión Login | Bloqueante |

---

## 2. Vista Login

**Objetivo:** autenticación segura con mínima fricción para usuario único.

| ID | Criterio de aceptación | Medición / evidencia |
|----|------------------------|----------------------|
| UX-L01 | Solo campos email y contraseña + «Entrar»; sin distracciones | ≤3 campos visibles |
| UX-L02 | Persistencia de sesión tras cerrar pestaña (JWT almacenado según diseño) | Reabrir app → Dashboard sin re-login (dentro de TTL) |
| UX-L03 | Error de credenciales: mensaje genérico («Email o contraseña incorrectos») | No revelar si el email existe |
| UX-L04 | Estado de carga en submit; doble tap no envía dos veces | Un solo request de login |
| UX-L05 | Logout accesible desde app autenticada (menú o ajustes) | Sesión invalidada en cliente |
| UX-L06 | Campos con `autocomplete` apropiado (`email`, `current-password`) | Auditoría HTML |

**Flujo aceptado:** abrir app → email (si no recordado) → contraseña → Entrar → Dashboard. **Meta:** ≤4 acciones, ≤15 s (login es excepción al objetivo de jornada; no bloquea release si jornada cumple).

---

## 3. Vista Dashboard

**Objetivo:** estado laboral de un vistazo y acceso prioritario a nueva jornada.

| ID | Criterio de aceptación | Medición / evidencia |
|----|------------------------|----------------------|
| UX-D01 | Botón **«+ Nueva jornada»** visible above the fold en móvil sin scroll | Captura 430×800 |
| UX-D02 | Resúmenes: hoy, semana, mes (horas); dinero estimado; extras conducción | Valores coinciden con API de resumen (misma fórmula que Historial) |
| UX-D03 | Lista «Últimas jornadas» (≥3 si existen): fecha, cliente (color), horas, total estimado | Escaneable en una línea o dos |
| UX-D04 | Tap en jornada reciente → edición (atajo) opcional pero recomendado | ≤2 acciones desde dashboard a editar |
| UX-D05 | Carga inicial con skeleton o placeholder; no pantalla en blanco >1s en red 4G simulada | Throttling DevTools |
| UX-D06 | Sin tablas anchas; cards o lista vertical | Sin scroll horizontal |
| UX-D07 | Acceso a Historial y Clientes sin enterrar (nav inferior o menú fijo ≤2 taps) | Mapa de navegación |

---

## 4. Vista Crear / Editar Jornada

**Objetivo:** registro extremadamente rápido; corazón del MVP.

### 4.1 Campos y prioridad visual

| Campo | Obligatorio | Presentación UX |
|-------|-------------|-----------------|
| Cliente/lugar | Sí | Selector con color; último cliente preseleccionado si existe |
| Hora inicio | Sí | Control nativo o picker de baja fricción |
| Hora fin | Sí | Por defecto «ahora» o fin ≥ inicio |
| Descanso (`break_minutes`) | No | Colapsado o secundario; default 0 |
| Notas | No | Colapsado / «Añadir nota» |
| Conducción + extra | No | Toggle + importe solo si activo |

### 4.2 Objetivo «<10 s, <5 acciones» — protocolo de medición

**Precondiciones:** usuario con sesión activa; ≥1 cliente; formulario con último cliente y horas por defecto válidas (p. ej. inicio hace 8h, fin = ahora).

| Paso | Acción contada | Objetivo tiempo acumulado |
|------|----------------|---------------------------|
| 1 | Tap «+ Nueva jornada» | ≤2 s |
| 2 | (Opcional) Cambiar cliente si el preseleccionado no es el deseado | ≤4 s |
| 3 | Ajustar hora fin solo si el default no sirve | ≤7 s |
| 4 | Tap «Guardar» | ≤10 s |

**Criterios bloqueantes (promedio de 5 intentos con usuario de prueba):**

| ID | Métrica | Umbral |
|----|---------|--------|
| UX-J01 | Tiempo medio registro completo (flujo feliz) | **<10 s** |
| UX-J02 | Número medio de acciones (flujo feliz) | **≤5** |
| UX-J03 | Tasa de éxito sin error de validación en flujo feliz | **100%** (5/5) |
| UX-J04 | Tras guardar, vuelta a Dashboard o confirmación clara | ≤1 acción adicional |
| UX-J05 | Cliente identificable por color/nombre en selector | Reconocimiento <2 s |

**Flujos alternativos aceptables (no cuentan para media del objetivo principal pero deben ser usables):**

- Primera jornada del día sin defaults: permitido **<20 s, ≤7 acciones**.
- Edición desde Historial: **<15 s, ≤6 acciones**.

### 4.3 Validación y mensajes

| ID | Criterio |
|----|----------|
| UX-J06 | `end_time` ≤ `start_time` → error antes de submit, campo resaltado |
| UX-J07 | `break_minutes` negativo bloqueado o corregido a 0 |
| UX-J08 | Cliente obligatorio: no permitir guardar sin selección |
| UX-J09 | Confirmación al salir con cambios sin guardar (opcional MVP; recomendado) |

---

## 5. Vista Historial

**Objetivo:** consultar, filtrar y corregir jornadas pasadas sin sobrecarga cognitiva.

| ID | Criterio de aceptación | Medición / evidencia |
|----|------------------------|----------------------|
| UX-H01 | Listado cronológico (más reciente primero) | Orden verificado con datos de prueba |
| UX-H02 | Filtro por rango de fechas con presets («Esta semana», «Este mes») recomendado | ≤2 acciones para filtro común |
| UX-H03 | Cada fila: fecha, cliente (color), horas netas, extras, total estimado | Misma fórmula que Dashboard |
| UX-H04 | Editar: abre mismo formulario que crear, datos precargados | Paridad de campos |
| UX-H05 | Eliminar: diálogo de confirmación con resumen (fecha + cliente) | 2 acciones (confirmar + eliminar) |
| UX-H06 | Estado vacío útil («Aún no hay jornadas» + CTA nueva jornada) | Copy claro |
| UX-H07 | Paginación o carga incremental si >50 registros (definir en implementación) | Sin bloqueo de UI |

---

## 6. Vista Clientes / Lugares

**Objetivo:** organización visual y tarifas sin romper el flujo rápido de jornada.

> El pliego no lista Clientes como «vista principal»; para el MVP se exige **pantalla o sección dedicada** accesible en ≤2 taps desde navegación global, no solo modal enterrado en ajustes.

| ID | Criterio de aceptación | Medición / evidencia |
|----|------------------------|----------------------|
| UX-C01 | Listado de clientes: nombre + muestra de color | Identificación visual inmediata |
| UX-C02 | Crear: nombre (obligatorio), color (default asignado), tarifa/hora opcional | ≤4 acciones hasta guardar |
| UX-C03 | Editar inline o formulario simple; mismos campos | Sin pantallas intermedias innecesarias |
| UX-C04 | Eliminar: confirmación; si hay jornadas asociadas, mensaje claro (bloqueo o cascada según decisión backend) | Copy acordado con API |
| UX-C05 | Tarifa opcional: UI indica «sin tarifa» cuando está vacía | Historial/Dashboard no muestran € falsos |
| UX-C06 | Desde formulario de jornada, acceso «Nuevo cliente» en ≤2 acciones y vuelta al formulario | No perder borrador de jornada (estado preservado) |
| UX-C07 | Paleta de colores limitada (≤12) para elegir rápido | Evitar color picker libre lento en móvil |

---

## 7. Mobile first y carga cognitiva

| Principio | Implementación esperada |
|-----------|-------------------------|
| Una tarea por pantalla | Login solo auth; formulario jornada sin dashboard embebido |
| Progressive disclosure | Notas, descanso, conducción secundarios |
| Reconocimiento > recuerdo | Colores de cliente, último usado, presets de fecha en historial |
| Consistencia | Mismos labels que pliego: «Cliente/lugar», «Conducción», «Extra conducción» |
| Prevención de errores | Defaults inteligentes (fin = ahora, break = 0) |
| PWA instalable | Manifest + icono; add to home screen probado en iOS/Android |

**Límites de carga cognitiva (checklist rápido):**

- Máximo **7±2** controles visibles simultáneos en formulario jornada (sin contar campos colapsados).
- Sin jerga legal/nómina en MVP.
- Sin gráficos complejos en Dashboard (solo números y lista).

---

## 8. Riesgos de fricción (pliego + lagunas) y mitigaciones

| Riesgo | Origen | Impacto UX | Mitigación MVP |
|--------|--------|------------|----------------|
| Gestión de clientes «colgada» fuera del flujo principal | Pliego §8 sin vista explícita | Usuario no encuentra tarifas; selector de jornada incompleto | Vista/sección Clientes en nav; «Nuevo cliente» desde formulario jornada |
| Fórmula de dinero/extras no definida | Laguna cálculos | Cifras distintas Dashboard vs Historial | Un solo endpoint de resumen; mismos labels y redondeo (2 decimales €) |
| Muchos campos opcionales visibles | §7.3 | Rompe <10 s / <5 acciones | Colapsar opcionales; defaults; último cliente |
| Selector de hora lento en móvil | Impl. nativa variable | >10 s en registro | `input type="time"` o wheels nativos; chips «Ahora», «Hace 8h» (si cabe en sprint) |
| Cruce de medianoche confuso | No en pliego | Errores al guardar turno nocturno | Validación clara; mensaje «La jornada termina el día siguiente» si aplica política |
| Sin zona horaria explícita | Laguna | Horas incorrectas al viajar | Documentar TZ del servidor/navegador; MVP: todo en TZ local del dispositivo |
| Edición/borrado sin política | Historial §7.4 | Borrados accidentales | Confirmación; deshacer no requerido en MVP |
| PWA offline ambiguo | Pliego PWA | Expectativa de registro sin red | Copy: «Requiere conexión» si no hay offline; o cola sync = fuera de MVP |
| Primer uso sin clientes | Bootstrap | Bloqueo en primera jornada | Onboarding mínimo: «Crea tu primer cliente» antes de jornada |
| Persistencia JWT larga | Login §7.1 | Riesgo en dispositivo compartido | Logout visible; opcional «No recordarme» en v2 |
| Contraste color cliente vs fondo | Color por cliente | Texto ilegible | Validar contraste o borde/texto sobre chip de color |

---

## 9. Matriz de aceptación por vista (resumen ejecutivo)

| Vista | Bloqueante MVP | Métrica clave |
|-------|----------------|---------------|
| Login | UX-L01, L03, L06, G10 | Sesión persistente funcional |
| Dashboard | UX-D01, D02, G01 | CTA nueva jornada above the fold |
| Jornada | **UX-J01, J02** | **<10 s, ≤5 acciones** |
| Historial | UX-H03, H05, H06 | Paridad de totales con Dashboard |
| Clientes | UX-C01, C05, C06 | Accesible ≤2 taps; tarifa opcional clara |

---

## 10. Evidencias recomendadas para cierre UX

1. Vídeo o captura de 5 registros seguidos (flujo feliz) con cronómetro visible.
2. Hoja de conteo de acciones firmada por revisor.
3. Screenshots móvil 375px y 430px de las 5 vistas.
4. Tabla de comparación Dashboard vs Historial vs API para 3 jornadas de prueba (con/sin tarifa, con extra conducción).

---

## Referencias

- Pliego: *Aplicación de Control de Horas* (HorarioPro).
- [MEJORAS-V2.md](../MEJORAS-V2.md) — lagunas y contrato de cálculo sugerido.
- [05-qa-checklist.md](./05-qa-checklist.md) — pruebas funcionales que validan estos criterios.
