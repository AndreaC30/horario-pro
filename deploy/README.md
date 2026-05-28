# Despliegue HorarioPro

## Local / pruebas con Docker

`docker-compose.override.yml` se aplica automáticamente:

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:8000/health  
- SPA: http://localhost:8080  
- SQLite en volumen `horario_sqlite_data`

## VPS (Nginx ya en el host)

No hay servicio Nginx en Compose. Ejemplo de upstreams:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;  # horario-frontend (mapear puerto si hace falta)
}
location /api/ {
    proxy_pass http://127.0.0.1:8000/;  # horario-backend
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Producción con PostgreSQL:

```bash
docker compose --profile postgres up -d --build
```

Ajustar `.env`: `DATABASE_URL`, secretos y `VITE_API_BASE_URL` para el dominio real.

## Sin Docker

Ver `backend/README.md` y `frontend/README.md`.
