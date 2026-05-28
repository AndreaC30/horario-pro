# WorkShift — Sistema de diseño UI (2026)

Marca visible en la app: **WorkShift** (dominio producción: `workshift.andreacruz.es`).  
Repositorio interno: `horario-pro`.

## Dirección visual

**Concepto:** *Dark glass productivity dashboard* — minimalista, premium, rápido (referencias: Linear, Notion Calendar, Vercel, Revolut).

- Modo oscuro por defecto (`html.dark`)
- Fondos profundos + gradiente radial suave
- Tarjetas glass (`backdrop-blur`, bordes `rgba(255,255,255,0.06)`)
- Acento morado eléctrico `#7C5CFF`
- Tipografía **Inter** (Google Fonts)
- Mobile first: botones ≥44px, FAB «+ Nueva jornada», bottom nav

## Tokens (Tailwind)

| Token | Valor |
|-------|--------|
| `background` | `#0B1020` |
| `surface` | `#12182B` |
| `primary` | `#7C5CFF` |
| `primary-hover` | `#9277FF` |
| `text-primary` | `#F5F7FA` |
| `text-secondary` | `#94A3B8` |
| `success` / `warning` / `danger` | `#22C55E` / `#F59E0B` / `#EF4444` |

Config: `frontend/tailwind.config.js`  
Utilidades: `frontend/src/index.css` (`.glass-card`, `.glass-input`)

## Colores de cliente (preset)

`#7C5CFF`, `#06B6D4`, `#22C55E`, `#F97316`, `#EC4899`, `#EAB308`, … — ver `ColorPicker.tsx`.

## Iconos y PWA

| Archivo | Uso |
|---------|-----|
| `public/icon-source.png` | Maestro (exportar desde diseño) |
| `favicon.ico`, `favicon-16/32.png` | Pestaña navegador |
| `apple-touch-icon.png` (180) | iOS Add to Home Screen |
| `pwa-192x192.png`, `pwa-512x512.png` | Android / manifest |
| `maskable-512x512.png` | Android adaptive icon (zona segura) |

Regenerar tras cambiar el logo:

```bash
cd frontend && npm run icons
```

Meta tags: `frontend/index.html`  
Manifest PWA: `vite.config.ts` → `vite-plugin-pwa`

### Plataformas

- **iOS:** `apple-touch-icon`, `apple-mobile-web-app-title`, `theme-color`, `status-bar-style`
- **Android:** manifest + maskable icon
- **Windows:** `msapplication-TileColor` / `TileImage`
- **Desktop:** favicon PNG/ICO en pestaña

## Componentes clave

| Componente | Ruta |
|------------|------|
| `BrandLogo` | Login |
| `Fab` | Dashboard (móvil) |
| `glass-card` / `glass-input` | Cards e inputs |
| `BottomNav` | Shell autenticado |

## Responsive

- Contenedor máximo `max-w-app` (32rem), centrado
- Grid métricas 2 columnas en móvil
- FAB oculto en texto muy estrecho (`max-[380px]:sr-only` en etiqueta larga)
- Clientes: acciones en fila en pantallas anchas (`sm:flex-nowrap`)
- CTA ancho completo en dashboard solo desde `sm:` (FAB en móvil)

## Implementación

No se añadió shadcn/framer/lucide en MVP para mantener el bundle pequeño; estilos aplicados sobre componentes existentes.

## Referencias

- [04-ux-criterios.md](./04-ux-criterios.md)
- [02-frontend-tareas.md](./02-frontend-tareas.md) — Fase 7 PWA
