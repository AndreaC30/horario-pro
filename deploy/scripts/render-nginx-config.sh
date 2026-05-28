#!/usr/bin/env bash
# Genera la config de Nginx a partir de la plantilla (INF-301)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DOMAIN="${APP_DOMAIN:-${1:-}}"
OUTPUT="${2:-/tmp/horariopro.conf}"

if [[ -z "$DOMAIN" ]]; then
  echo "Uso: APP_DOMAIN=horario.ejemplo.com $0"
  echo "  o: $0 horario.ejemplo.com [/ruta/salida.conf]"
  exit 1
fi

TEMPLATE="$ROOT_DIR/deploy/nginx/sites-available/horariopro.conf.template"
sed "s/__DOMAIN__/$DOMAIN/g" "$TEMPLATE" > "$OUTPUT"
echo "Generado: $OUTPUT"
echo "Revisa ssl_certificate paths tras certbot."
