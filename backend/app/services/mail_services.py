import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST", "mail.privateemail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
MAIL_FROM = os.getenv("MAIL_FROM", "MyCabinet <no-reply@mycabinet.me>")
REPLY_TO = os.getenv("REPLY_TO")


# --- Utility functions ---
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
    # Plain text fallback
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


# --- Email verification ---
def send_verification_email(to: str, verify_url: str) -> None:
    subject = "Verify your MyCabinet account"
    html = f"""
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
    <h2>Welcome to MyCabinet</h2>
    <p>Confirm your email to finish setting up your account.</p>
    <p>
        <a href="{verify_url}"
        style="background:#111;color:#fff;
                padding:10px 16px;
                border-radius:8px;
                text-decoration:none;">
        Verify Email
        </a>
    </p>
    <p>
        If the button doesn’t work, paste this link in your browser:<br/>
        {verify_url}
    </p>
    </div>
    """
    text = f"Verify your MyCabinet account: {verify_url}"
    send_email(to, subject, html, text)


# --- Login (magic link) ---
def send_login_link(to: str, login_url: str) -> None:
    subject = "MyCabinet: Sign in securely"
    html = f"""
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
    <h2>Sign in to MyCabinet</h2>
    <p>Tap the button to finish signing in. This link expires soon.</p>
    <p>
        <a href="{login_url}"
        style="background:#111;color:#fff;
                padding:10px 16px;
                border-radius:8px;
                text-decoration:none;">
        Sign in
        </a>
    </p>
    <p>
        If the button doesn’t work, paste this link in your browser:<br/>
        {login_url}
    </p>
    <p style="color:#666;font-size:12px;margin-top:16px;">
        If you didn’t request this, you can safely ignore this email.
    </p>
    </div>
    """
    text = f"Sign in to MyCabinet: {login_url}\nIf you didn’t request this, ignore this email."
    send_email(to, subject, html, text)


# --- Login (one-time 6-digit code) ---
def send_login_code(to: str, code: str) -> None:
    subject = "MyCabinet: Your sign-in code"
    html = f"""
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
    <h2>Your sign-in code</h2>
    <p>Enter this 6-digit code to continue. It expires in a few minutes.</p>
    <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:12px 0;">
        {code}
    </div>
    <p style="color:#666;font-size:12px;">
        If you didn’t request this, you can ignore this email.
    </p>
    </div>
    """
    text = f"Your MyCabinet sign-in code: {code}\nIf you didn’t request this, ignore this email."
    send_email(to, subject, html, text)


# --- Password reset ---
def send_password_reset(to: str, reset_url: str) -> None:
    subject = "MyCabinet: Reset your password"
    html = f"""
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
    <h2>Reset your password</h2>
    <p>
        You requested a password reset. Click the button to choose a new password.
        This link expires soon.
    </p>
    <p>
        <a href="{reset_url}"
        style="background:#111;color:#fff;
                padding:10px 16px;
                border-radius:8px;
                text-decoration:none;">
        Reset Password
        </a>
    </p>
    <p>
        If the button doesn’t work, paste this link in your browser:<br/>
        {reset_url}
    </p>
    <p style="color:#666;font-size:12px;margin-top:16px;">
        If you didn’t request this, you can safely ignore this email.
    </p>
    </div>
    """
    text = (
        "Reset your MyCabinet password: "
        f"{reset_url}\n"
        "If you didn’t request this, ignore this email."
    )
    send_email(to, subject, html, text)


# --- Notify after a successful change ---
def send_password_changed_notice(to: str) -> None:
    subject = "MyCabinet: Your password was changed"
    html = """
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <h2>Password changed</h2>
      <p>Your MyCabinet password was just changed. If this wasn’t you, reset it immediately.</p>
    </div>
    """
    text = (
        "Your MyCabinet password was changed. If this wasn’t you, reset it immediately."
    )
    send_email(to, subject, html, text)
