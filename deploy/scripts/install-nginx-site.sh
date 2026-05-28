#!/usr/bin/env bash
# Instala snippets y site en Nginx del host (requiere sudo)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DOMAIN="${APP_DOMAIN:-${1:-}}"

if [[ -z "$DOMAIN" ]]; then
  echo "Uso: sudo APP_DOMAIN=horario.ejemplo.com $0"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Ejecuta con sudo."
  exit 1
fi

mkdir -p /var/www/certbot
cp "$ROOT_DIR/deploy/nginx/snippets/proxy-params.conf" /etc/nginx/snippets/horariopro-proxy-params.conf
cp "$ROOT_DIR/deploy/nginx/snippets/security-headers.conf" /etc/nginx/snippets/horariopro-security-headers.conf
cp "$ROOT_DIR/deploy/nginx/conf.d/horariopro-rate-limit.conf" /etc/nginx/conf.d/horariopro-rate-limit.conf

APP_DOMAIN="$DOMAIN" "$ROOT_DIR/deploy/scripts/render-nginx-config.sh" "$DOMAIN" /etc/nginx/sites-available/horariopro.conf
ln -sf /etc/nginx/sites-available/horariopro.conf /etc/nginx/sites-enabled/horariopro.conf

nginx -t
systemctl reload nginx
echo "Site horariopro habilitado para $DOMAIN"
