#!/usr/bin/env bash
# TLS Let's Encrypt en el host (INF-302)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DOMAIN="${APP_DOMAIN:-${1:-}}"
EMAIL="${CERTBOT_EMAIL:-${2:-}}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Uso: sudo APP_DOMAIN=horario.ejemplo.com CERTBOT_EMAIL=admin@ejemplo.com $0"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Ejecuta con sudo."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
if ! command -v certbot >/dev/null 2>&1; then
  apt-get update
  apt-get install -y certbot
fi

mkdir -p /var/www/certbot

# 1) Bootstrap HTTP (ACME)
sed "s/__DOMAIN__/$DOMAIN/g" \
  "$ROOT_DIR/deploy/nginx/sites-available/horariopro-http-bootstrap.conf.template" \
  > /etc/nginx/sites-available/horariopro.conf
ln -sf /etc/nginx/sites-available/horariopro.conf /etc/nginx/sites-enabled/horariopro.conf
nginx -t && systemctl reload nginx

# 2) Certificado
if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    --email "$EMAIL" --agree-tos --no-eff-email
fi

# 3) Site completo HTTPS
cp "$ROOT_DIR/deploy/nginx/snippets/proxy-params.conf" /etc/nginx/snippets/horariopro-proxy-params.conf
cp "$ROOT_DIR/deploy/nginx/snippets/security-headers.conf" /etc/nginx/snippets/horariopro-security-headers.conf
cp "$ROOT_DIR/deploy/nginx/conf.d/horariopro-rate-limit.conf" /etc/nginx/conf.d/horariopro-rate-limit.conf

APP_DOMAIN="$DOMAIN" "$ROOT_DIR/deploy/scripts/render-nginx-config.sh" "$DOMAIN" /etc/nginx/sites-available/horariopro.conf
nginx -t && systemctl reload nginx

echo "TLS listo. Renovación: sudo certbot renew --dry-run"
