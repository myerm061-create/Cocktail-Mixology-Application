import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Literal, Optional

from dotenv import load_dotenv

load_dotenv()

# SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST", "mail.privateemail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
MAIL_FROM = os.getenv("MAIL_FROM", "MyCabinet <no-reply@mycabinet.me>")
REPLY_TO = os.getenv("REPLY_TO")


# ---- Utility functions ----
def _require_creds():
    if not (SMTP_USER and SMTP_PASS):
        raise RuntimeError("SMTP_USER/SMTP_PASS not set. Did you create backend/.env?")


def _build_message(
    to: str, subject: str, html: str, text: Optional[str] = None
) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    if REPLY_TO:
        msg["Reply-To"] = REPLY_TO
    # Plain text fallback (never include secrets beyond the OTP code)
    msg.set_content(text or " ")
    # HTML body
    msg.add_alternative(html, subtype="html")
    return msg


def send_email(to: str, subject: str, html: str, text: Optional[str] = None) -> None:
    """Synchronous send. Use with FastAPI BackgroundTasks for non-blocking behavior."""
    _require_creds()
    ctx = ssl.create_default_context()
    msg = _build_message(to, subject, html, text)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
        s.starttls(context=ctx)
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)


# ---- Shared code template ----
def _format_code_for_html(code: str) -> str:
    # normalize and add a bit of tracking-friendly spacing for readability
    c = "".join(ch for ch in code if ch.isdigit())
    # group as 3-3 or 4-4 depending on length; fallback to plain
    if len(c) == 6:
        return f"{c[:3]}&nbsp;&nbsp;{c[3:]}"
    if len(c) == 8:
        return f"{c[:4]}&nbsp;&nbsp;{c[4:]}"
    return c


def send_code(to: str, subject: str, code: str) -> None:
    """
    Generic code sender used by all intents (login/verify/reset/delete).
    No links, no deep links—OTP-only.
    """
    safe_code_html = _format_code_for_html(code)
    html = f"""
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.45">
      <h2 style="margin:0 0 12px 0">{subject}</h2>
      <p style="margin:0 0 12px 0">Enter this code in the app. It expires in a few minutes.</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:12px 0 16px 0">
        {safe_code_html}
      </div>
      <p style="color:#666;font-size:12px;margin:12px 0 0 0">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
    """
    text = (
        f"{subject}\n"
        f"Your code: {code}\n"
        "If you didn’t request this, ignore this email."
    )
    send_email(to, subject, html, text)


# ---- Intent-specific wrappers ----
Intent = Literal["login", "verify", "reset", "delete"]

SUBJECTS: dict[Intent, str] = {
    "login": "Your MyCabinet code",
    "verify": "Verify your email – code",
    "reset": "Reset code",
    "delete": "Confirm deletion code",
}


def send_login_code(to: str, code: str) -> None:
    send_code(to, SUBJECTS["login"], code)


def send_verify_code(to: str, code: str) -> None:
    send_code(to, SUBJECTS["verify"], code)


def send_reset_code(to: str, code: str) -> None:
    send_code(to, SUBJECTS["reset"], code)


def send_delete_code(to: str, code: str) -> None:
    send_code(to, SUBJECTS["delete"], code)


# ---- Notify after a successful change ----
def send_password_changed_notice(to: str) -> None:
    subject = "MyCabinet: Your password was changed"
    html = """
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.45">
      <h2 style="margin:0 0 12px 0">Password changed</h2>
      <p style="margin:0">Your MyCabinet password was just changed.
      If this wasn’t you, reset it immediately.</p>
    </div>
    """
    text = (
        "Your MyCabinet password was changed. If this wasn’t you, reset it immediately."
    )
    send_email(to, subject, html, text)
