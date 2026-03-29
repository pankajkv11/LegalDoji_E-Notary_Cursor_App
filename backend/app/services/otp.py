"""OTP generation, in-memory storage, and delivery via SMS (Twilio).
# SMTP email delivery is commented out — re-enable once Gmail App Password is configured.
"""
import asyncio
import random
import string
from datetime import datetime, timedelta, timezone
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
from typing import Optional

# import aiosmtplib

from app.core.config import get_settings

OTP_EXPIRE_SECONDS = 300  # 5 minutes

# In-memory store: {contact: {"code": str, "expires_at": datetime}}
# Good for single-process / dev. For multi-process production use Redis.
_store: dict[str, dict] = {}
_lock = asyncio.Lock()


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


async def _store_otp(contact: str, code: str) -> None:
    async with _lock:
        _store[contact] = {
            "code": code,
            "expires_at": datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRE_SECONDS),
        }


async def verify_otp(contact: str, code: str) -> bool:
    """Return True and consume the OTP if valid; False otherwise."""
    async with _lock:
        record = _store.get(contact)
        if not record:
            return False
        if datetime.now(timezone.utc) > record["expires_at"]:
            del _store[contact]
            return False
        if record["code"] != code:
            return False
        del _store[contact]
        return True


# async def _send_email(email: str, code: str) -> None:
#     settings = get_settings()
#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = "Your LegalDoji Verification Code"
#     msg["From"] = settings.smtp_from_email or settings.smtp_username
#     msg["To"] = email
#
#     html = f"""
#     <html>
#     <body style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
#       <h2 style="color:#1a1a1a">Verify your email</h2>
#       <p style="color:#555">Use the code below to complete your LegalDoji sign-up.</p>
#       <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
#         <span style="font-size:40px;letter-spacing:12px;font-weight:700;color:#1a1a1a">{code}</span>
#       </div>
#       <p style="color:#888;font-size:13px">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
#     </body>
#     </html>
#     """
#     msg.attach(MIMEText(html, "html"))
#
#     await aiosmtplib.send(
#         msg,
#         hostname=settings.smtp_host,
#         port=settings.smtp_port,
#         username=settings.smtp_username,
#         password=settings.smtp_password,
#         start_tls=settings.smtp_start_tls,
#         use_tls=settings.smtp_use_tls,
#         validate_certs=False,
#     )


async def _send_sms(phone: str, code: str) -> None:
    settings = get_settings()

    def _sync() -> None:
        from twilio.rest import Client  # type: ignore
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=f"Your LegalDoji verification code is {code}. Valid for 5 minutes.",
            from_=settings.twilio_phone_number,
            to=phone,
        )

    await asyncio.to_thread(_sync)


async def generate_and_send(
    email: Optional[str] = None,
    phone: Optional[str] = None,
) -> tuple[bool, str]:
    """Generate one OTP code, store it for each contact, and deliver it.

    Returns (success, message).
    """
    if not phone:
        return False, "Provide a phone number."

    code = _generate_code()
    tasks = []

    # Email delivery disabled — re-enable _send_email once Gmail App Password is set up
    # if email:
    #     await _store_otp(email, code)
    #     tasks.append(_send_email(email, code))

    if phone:
        await _store_otp(phone, code)
        tasks.append(_send_sms(phone, code))

    try:
        await asyncio.gather(*tasks)
        return True, "OTP sent successfully."
    except Exception as exc:
        return False, f"Failed to send OTP: {exc}"
