# Nginx + HTTPS (Fase 3 — INF-301…305)

> **Tu VPS usa nginx-proxy en Docker** (`~/nginx-proxy`, `default.conf`, red `gastodehoy_backend`).  
> Sigue **[`../nginx-proxy/README.md`](../nginx-proxy/README.md)** — este directorio es para Nginx instalado en el **sistema operativo** (alternativa).

## Arquitectura

```text
Internet :443/:80
    → Nginx (host)
        /           → 127.0.0.1:8080  (horario-frontend)
        /api/       → 127.0.0.1:8000  (horario-backend, rate limit)
        /health     → 127.0.0.1:8000/health
```

## Prerrequisitos

- DNS `A` / `AAAA` del dominio → IP del VPS
- Puertos **80** y **443** abiertos (UFW)
- Stack Docker en producción:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build
```

## Variables `.env` en el servidor

```env
APP_DOMAIN=horario.tudominio.com
APP_BASE_URL=https://horario.tudominio.com
CORS_ORIGINS=https://horario.tudominio.com
VITE_API_BASE_URL=/api
```

## Instalación (orden)

1. **Rate limit zone** (una vez): ya copia `install-nginx-site.sh`
2. **Site + snippets:**

```bash
sudo APP_DOMAIN=horario.tudominio.com ./deploy/scripts/install-nginx-site.sh
```

3. **Certificado Let's Encrypt (INF-302):**

```bash
sudo APP_DOMAIN=horario.tudominio.com CERTBOT_EMAIL=tu@email.com ./deploy/scripts/certbot-init.sh
```

4. **Renovación automática:** `certbot.timer` (systemd) en Ubuntu; comprobar:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

5. **Smoke:**

```bash
APP_BASE_URL=https://horario.tudominio.com ./deploy/scripts/smoke-https.sh
```

## INF-304 — Límites

| Directiva | Valor | Motivo |
|-----------|-------|--------|
| `client_max_body_size` | `1m` | MVP sin uploads grandes |
| `proxy_read_timeout` | `60s` | API habitual |
| `proxy_connect_timeout` | `30s` | Arranque contenedor |

## INF-305 — Rate limiting

- Zona `horario_api`: **10 req/s** por IP, ráfaga **20**
- Respuesta **429** si se excede
- Ajustar en `deploy/nginx/conf.d/horariopro-rate-limit.conf`

## INF-303 — Cabeceras

Ver `snippets/security-headers.conf` (HSTS, nosniff, frame options).

## Solo generar config (sin instalar)

```bash
APP_DOMAIN=horario.tudominio.com ./deploy/scripts/render-nginx-config.sh
```
