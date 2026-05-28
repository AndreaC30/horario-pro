# HorarioPro + nginx-proxy centralizado (tu VPS)

Convención real del servidor: **un solo** `default.conf` en  
`/root/nginx-proxy/nginx/conf.d/`, contenedor `nginx-proxy`, red Docker **`gastodehoy_backend`**, Certbot en el mismo stack.

Los scripts en `deploy/scripts/` (install en `/etc/nginx`) son **alternativa** si algún día usas Nginx en el host; **no los uses** con tu `~/nginx-proxy`.

## 1. Red Docker compartida

En el VPS, HorarioPro debe unirse a la misma red que el proxy:

```bash
cd /ruta/a/horario-pro
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build
```

`docker-compose.prod.yml` declara la red externa `gastodehoy_backend` y los nombres de contenedor `horario-backend` / `horario-frontend` (como en el ejemplo de gastodehoy → `app:8000`).

## 2. Bloque en `default.conf`

Copia el contenido de [`horariopro-server-block.conf.example`](./horariopro-server-block.conf.example) **al final** del archivo, **antes** del bloque global de redirect HTTP→HTTPS.

Ajusta:

- `server_name` y rutas de certificados → `workshift.andreacruz.es` (ya en el `.example`).
- `X-Frame-Options SAMEORIGIN` (SPA); sin CSP global como gastodehoy.

### Rate limit (opcional)

Si aún no existe en `nginx.conf` del proxy, en el contexto `http { }` del proxy:

```nginx
limit_req_zone $binary_remote_addr zone=horario_api:10m rate=10r/s;
```

(El ejemplo del bloque usa `zone=horario_api`.)

## 3. Redirect HTTP → HTTPS

En el `server { listen 80; ... server_name ... }` compartido, añade tu dominio:

```nginx
server_name gastodehoy.kyadigital.es ... workshift.andreacruz.es;
```

## 4. Certificado SSL

Desde `~/nginx-proxy`:

```bash
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
  -d workshift.andreacruz.es --email TU_EMAIL --agree-tos
```

## 5. Variables `.env` de HorarioPro (VPS)

```env
APP_DOMAIN=workshift.andreacruz.es
APP_BASE_URL=https://workshift.andreacruz.es
CORS_ORIGINS=https://workshift.andreacruz.es
VITE_API_BASE_URL=/api
```

Rebuild del frontend tras cambiar `VITE_API_BASE_URL`:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build horario-frontend
```

## 6. Recargar nginx-proxy

```bash
cd ~/nginx-proxy
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

## 7. Comprobar

```bash
curl -fsS https://workshift.andreacruz.es/health
```

Login en `https://workshift.andreacruz.es`.

## Servicios solo en el host

Si en algún momento el backend/frontend no estuvieran en Docker, usarías `host.docker.internal:PUERTO` (como portfolio en tu VPS). HorarioPro en producción va **por nombre de contenedor** en `gastodehoy_backend`.
