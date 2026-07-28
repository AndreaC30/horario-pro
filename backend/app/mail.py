"""Optional SMTP helpers for WorkShift (forgot-password)."""

from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


class SMTPNotConfiguredError(RuntimeError):
    """Missing SMTP_* settings."""


def send_email(to_email: str, subject: str, body: str) -> None:
    settings = get_settings()
    host = settings.smtp_host
    if not host or not host.strip():
        raise SMTPNotConfiguredError("SMTP_HOST no está configurado")

    from_addr = settings.smtp_from or settings.smtp_user
    if not from_addr:
        raise SMTPNotConfiguredError("SMTP_FROM o SMTP_USER deben estar configurados")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.set_content(body)

    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(host, settings.smtp_port) as smtp:
            if settings.smtp_user and settings.smtp_password:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(host, settings.smtp_port) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_user and settings.smtp_password:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)


def send_forgot_password_email(to_email: str, temporary_password: str) -> None:
    subject = "WorkShift — contraseña temporal"
    body = (
        "Has solicitado recuperar el acceso a WorkShift.\n\n"
        f"Tu contraseña temporal es: {temporary_password}\n\n"
        "Entra con este correo y esa contraseña, y cámbiala desde Cuenta.\n\n"
        "Si no has sido tú, ignora este mensaje.\n"
    )
    send_email(to_email, subject, body)
