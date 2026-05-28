# HorarioPro — Índice del pliego desglosado

Descomposición del MVP en tareas por capa. Generado a partir del pliego *Aplicación de Control de Horas*.

| Documento | Contenido |
|-----------|-----------|
| [01-backend-tareas.md](./01-backend-tareas.md) | API FastAPI, modelo de datos, auth, CRUD, cálculos |
| [02-frontend-tareas.md](./02-frontend-tareas.md) | React/Vite/PWA, vistas, componentes, integración API |
| [03-infra-tareas.md](./03-infra-tareas.md) | Docker Compose, Nginx, HTTPS, entornos |
| [04-ux-criterios.md](./04-ux-criterios.md) | Criterios UX medibles por vista |
| [05-qa-checklist.md](./05-qa-checklist.md) | Casos de prueba y regresión MVP |

## Mejoras y v2

- [MEJORAS-V2.md](../MEJORAS-V2.md) — lagunas del pliego, mejoras pre-código y roadmap v2.

## Orden sugerido de ejecución

1. Infra local (compose dev) + esqueleto backend/frontend  
2. Auth + bootstrap usuario único  
3. CRUD clientes → CRUD jornadas → resúmenes dashboard  
4. UI vistas en paralelo tras contrato API estable  
5. PWA + despliegue VPS  
6. QA según checklist antes de uso diario real  
