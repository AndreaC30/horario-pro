#!/usr/bin/env bash
# INF-501: backup diario PostgreSQL (ejecutar en el VPS con cron).
# Uso: ./deploy/scripts/backup-postgres.sh /ruta/backups
set -euo pipefail

BACKUP_DIR="${1:-/var/backups/horariopro}"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
PROFILE="--profile postgres"
CONTAINER="${POSTGRES_CONTAINER:-horario-pro-horario-db-1}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/horario_pro-${STAMP}.sql.gz"

echo "Dump → $FILE"
docker compose $COMPOSE_FILES $PROFILE exec -T horario-db \
  pg_dump -U "${POSTGRES_USER:-horario_app}" -d "${POSTGRES_DB:-horario_pro}" \
  | gzip -9 > "$FILE"

find "$BACKUP_DIR" -name 'horario_pro-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
echo "OK. Retención ${RETENTION_DAYS} días."
