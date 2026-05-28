"""CLI de mantenimiento: python -m app.cli create-user --email ... --password ..."""

from __future__ import annotations

import argparse
import sys

from app.db.session import SessionLocal
from app.services import auth_service


def cmd_create_user(email: str, password: str) -> int:
    db = SessionLocal()
    try:
        auth_service.create_user(db, email, password)
        print(f"Usuario creado: {auth_service.normalize_email(email)}")
        return 0
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    finally:
        db.close()


def cmd_bootstrap(email: str, password: str) -> int:
    db = SessionLocal()
    try:
        user = auth_service.bootstrap_user_if_missing(db, email, password)
        if user:
            print(f"Usuario listo: {user.email}")
        return 0
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="HorarioPro backend CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_user_parser = subparsers.add_parser("create-user", help="Crear usuario (falla si el email existe)")
    create_user_parser.add_argument("--email", required=True)
    create_user_parser.add_argument("--password", required=True)

    bootstrap_parser = subparsers.add_parser("bootstrap-user", help="Crear usuario solo si no existe")
    bootstrap_parser.add_argument("--email", required=True)
    bootstrap_parser.add_argument("--password", required=True)

    args = parser.parse_args()

    if args.command == "create-user":
        sys.exit(cmd_create_user(args.email, args.password))
    if args.command == "bootstrap-user":
        sys.exit(cmd_bootstrap(args.email, args.password))

    parser.error("Comando no reconocido")


if __name__ == "__main__":
    main()
