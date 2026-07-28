# WorkShift — Sistema de diseño UI

Marca visible: **WorkShift** (prod: `workshift.andreacruz.es`).  
Repo: `horario-pro`.

## Dirección visual

**Concepto:** *Dense productivity UI* al estilo GastoDeHoy / Observabilidad V11, con **identidad azul WorkShift** (no cian GDH, no morado legacy).

- Dark por defecto (`html.dark`), light disponible
- Superficies densas, tipografía Inter / Space Grotesk / JetBrains Mono
- Jerarquía por **espacio + tipografía**, no por cajas con borde azul
- Acento: `#2563EB` (light) / `#3B82F6` (dark)
- Mobile first: touch ≥44px, FAB «+ Nueva jornada», bottom nav

## Tokens (CSS)

Definidos en `frontend/src/index.css` (`:root` / `html.dark`):

| Rol | Light | Dark |
|-----|-------|------|
| Fondo | `#f8fafc` | `#070b1e` |
| Surface | `#ffffff` | `#0a194b` |
| Acento | `#2563eb` | `#3b82f6` |
| Texto | `#0f172a` | `#eef2ff` |

Clases de superficie:

| Clase | Uso |
|-------|-----|
| `.card` | Contenedor suave (borde muy sutil, sin sombra fuerte) |
| `.card-accent` | Hero / foco: barra lateral azul, sin caja “glow” |
| `.stat-card` | KPI: fondo soft **sin borde** |
| `.list-item` | Filas: sin borde; hover con accent-muted |

Tipografía: `frontend/src/lib/typography.ts` (`TYPE_EYEBROW`, `TYPE_DISPLAY`, `TYPE_HERO_NUMBER`, …).

## Arquitectura de Inicio (dashboard)

Una columna; un job por sección:

1. **Hoy** — fecha + horas/€ del día (o empty quieto “Sin horas hoy”)
2. **Este mes** — selector + 2 KPIs (horas \| ingresos) + línea secundaria de semana
3. **Por cliente** — toggle semana/mes + ranking (sin repetir total del mes)
4. **Actividad** — últimas jornadas (separador, no card anidada)

## Colores de cliente (preset)

Ver `ColorPicker.tsx` — presets saturados legibles sobre dark/light.

## Iconos y PWA

| Archivo | Uso |
|---------|-----|
| `public/icon-source.png` | Maestro |
| favicons / apple-touch / pwa-* / maskable | Navegador e instalación |

```bash
cd frontend && npm run icons
```

## Componentes clave

| Componente | Notas |
|------------|--------|
| `BrandLogo` | Login / landing |
| `Fab` | CTA móvil |
| `BottomNav` | Shell autenticado |
| `LandingPage` | Preview pública antes de login |

## Responsive

- Shell `max-w-app` (36rem) → `md:max-w-3xl`
- CTA desktop bajo mes; FAB en móvil
- Evitar grids de métricas >2 en el primer viewport

## Qué evitar

- Bordes accent en cada card/hover (sensación “todo azul + cajas”)
- Repetir el mismo total (mes) en 3 sitios
- Hero vacío con “0 h” enorme compitiendo con el mes
- Efectos aurora / shine / glass morado (retirados)

## Referencias

- [04-ux-criterios.md](./04-ux-criterios.md)
- [02-frontend-tareas.md](./02-frontend-tareas.md)
- Canvas: `workshift-inicio-ux-study.canvas.tsx` (estudio Fase A/B)
