#!/bin/sh
set -e

alembic upgrade head

if [ -n "$BOOTSTRAP_USER_EMAIL" ] && [ -n "$BOOTSTRAP_USER_PASSWORD" ]; then
  python -m app.cli bootstrap-user \
    --email "$BOOTSTRAP_USER_EMAIL" \
    --password "$BOOTSTRAP_USER_PASSWORD"
fi

exec "$@"
