# HorarioPro — Frontend

React 19 + Vite 6 + Tailwind. PWA instalable (Fase 7 del pliego).

## Variables de entorno

Definidas en la raíz del monorepo (`horario-pro/.env`). Vite las carga con `envDir: ".."`:

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | Base de la API. Local: `http://localhost:8000`. Producción mismo origen: `/api` |
| `VITE_DEV_BYPASS_AUTH` | `true` solo desarrollo nativo sin login (Docker: `false`) |

Ver [`.env.example`](../.env.example).

## Comandos

```bash
npm ci
npm run dev          # http://localhost:5173 (PWA dev habilitada)
npm run build        # dist/ + service worker
npm run preview      # previsualizar build
npm run icons        # regenerar PNG desde public/icon.svg (requiere sharp)
```

## PWA (FE-060–063)

- **Manifest** + iconos 192/512 generados en `public/`.
- **Service worker** (`vite-plugin-pwa`): shell en caché; GET `/api/*` network-first.
- **Offline**: banner en app autenticada; POST/PATCH/DELETE bloqueados sin red.
- **Instalar**: Chrome → «Instalar app»; iOS → Compartir → «Añadir a pantalla de inicio».

Tras desplegar una versión nueva, el SW se actualiza solo (`registerType: autoUpdate`).

## Estructura

- `src/pages/` — vistas por ruta
- `src/components/domain/` — formularios y listas de negocio
- `src/services/` — cliente HTTP (`apiClient`)
- `public/` — iconos PWA estáticos

## Tests E2E (QA)

```bash
# Docker en :8080 + .env con bootstrap
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium   # primera vez
npm run test:e2e
```

Cubre login, logout, sesión, CTA dashboard, historial/eliminar, XSS en notas, scroll horizontal. Ver [`docs/pliego/05-qa-ejecucion.md`](../docs/pliego/05-qa-ejecucion.md).
