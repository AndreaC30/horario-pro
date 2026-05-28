#!/usr/bin/env bash
# Smoke test post-deploy HTTPS (INF-406 parcial)
set -euo pipefail

BASE_URL="${APP_BASE_URL:-${1:-}}"

if [[ -z "$BASE_URL" ]]; then
  echo "Uso: APP_BASE_URL=https://horario.ejemplo.com $0"
  exit 1
fi

echo "==> GET $BASE_URL/health"
curl -fsS "$BASE_URL/health" | head -c 200
echo ""
echo ""

echo "==> GET $BASE_URL/ (SPA)"
code=$(curl -fsS -o /dev/null -w "%{http_code}" "$BASE_URL/")
echo "HTTP $code"
test "$code" = "200"

echo "OK: smoke HTTPS básico"
