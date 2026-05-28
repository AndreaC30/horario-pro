# Despliegue HorarioPro

## Local / pruebas (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

- App: http://localhost:8080  
- API: http://localhost:8000  
- `docker-compose.override.yml` → SQLite y puertos locales.

## Producción en VPS (tu setup: nginx-proxy)

Stack centralizado en `~/nginx-proxy` + red **`gastodehoy_backend`**.  
**Guía paso a paso:** [`nginx-proxy/README.md`](./nginx-proxy/README.md)

Resumen:

1. `make docker-prod` (o compose con `docker-compose.prod.yml`) — contenedores en la red del proxy.
2. Añadir bloque `server` en `/root/nginx-proxy/nginx/conf.d/default.conf` desde  
   [`nginx-proxy/horariopro-server-block.conf.example`](./nginx-proxy/horariopro-server-block.conf.example).
3. Certbot con `docker compose run --rm certbot ...` en `~/nginx-proxy`.
4. `docker compose exec nginx nginx -s reload`.

No uses `deploy/scripts/install-nginx-site.sh` ni `certbot-init.sh` salvo que migres a Nginx en el host.

### Variables `.env` en el servidor

| Variable | Ejemplo |
|----------|---------|
| `DOCKER_PROXY_NETWORK` | `gastodehoy_backend` (default) |
| `APP_DOMAIN` | `workshift.andreacruz.es` |
| `APP_BASE_URL` | `https://workshift.andreacruz.es` |
| `CORS_ORIGINS` | misma URL |
| `VITE_API_BASE_URL` | `/api` |

## Alternativa: Nginx instalado en el SO

Ver [`nginx/README.md`](./nginx/README.md) (plantillas y scripts para `/etc/nginx`). No aplica a tu VPS actual.

## Sin Docker

Ver `backend/README.md` y `frontend/README.md`.
