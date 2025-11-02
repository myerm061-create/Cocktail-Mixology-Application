import os, ssl, smtplib
from dotenv import load_dotenv
from email.message import EmailMessage

# Test SMTP configuration by sending a test email to SMTP_USER (itself)
load_dotenv()
msg = EmailMessage()
msg["From"] = os.getenv("MAIL_FROM")
msg["To"] = os.getenv("SMTP_USER")
msg["Subject"] = "MyCabinet SMTP test"
msg.set_content("Plain text fallback.")
msg.add_alternative("<p><b>SMTP is live.</b></p>", subtype="html")

ctx = ssl.create_default_context()
with smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT", "587")), timeout=20) as s:
    s.starttls(context=ctx)
    s.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
    s.send_message(msg)

print("Sent.")
