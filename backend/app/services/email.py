"""Email notification service."""
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import get_settings


def _base_template(title: str, body_html: str) -> str:
    return f"""
    <html>
    <body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <!-- Header -->
            <tr>
              <td style="background:#111827;padding:28px 40px">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px">⚖️ LegalDoji</h1>
                <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">E-Notary & Legal Document Platform</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 40px">
                <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700">{title}</h2>
                {body_html}
                <p style="margin:32px 0 0;color:#6b7280;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px">
                  This is an automated message from LegalDoji. Please do not reply to this email.<br>
                  &copy; 2026 LegalDoji. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """


async def _send(to_email: str, subject: str, html: str) -> None:
    settings = get_settings()
    if not settings.smtp_username or not settings.smtp_password:
        return  # silently skip if SMTP not configured

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"LegalDoji <{settings.smtp_from_email or settings.smtp_username}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_username,
        password=settings.smtp_password,
        start_tls=settings.smtp_start_tls,
        use_tls=settings.smtp_use_tls,
        validate_certs=False,
    )


async def send_kyc_approved(to_email: str, name: str) -> None:
    body = f"""
    <p style="color:#374151;font-size:15px;line-height:1.6">Hi <strong>{name}</strong>,</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin:20px 0">
      <p style="margin:0;color:#15803d;font-weight:600;font-size:15px">✅ Your KYC has been approved!</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      Your identity has been successfully verified. You can now create and notarize legal documents on LegalDoji.
    </p>
    <a href="http://localhost:3000/dashboard" style="display:inline-block;margin-top:8px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
      Go to Dashboard →
    </a>
    """
    await _send(to_email, "✅ KYC Approved — LegalDoji", _base_template("KYC Verification Approved", body))


async def send_kyc_rejected(to_email: str, name: str) -> None:
    body = f"""
    <p style="color:#374151;font-size:15px;line-height:1.6">Hi <strong>{name}</strong>,</p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:6px;padding:16px 20px;margin:20px 0">
      <p style="margin:0;color:#dc2626;font-weight:600;font-size:15px">❌ Your KYC has been rejected.</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      Unfortunately, we could not verify your identity with the documents provided. Please re-submit your KYC with clear, valid documents.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      Common reasons for rejection:
    </p>
    <ul style="color:#374151;font-size:14px;line-height:1.8;padding-left:20px">
      <li>Blurry or unreadable document images</li>
      <li>Name mismatch between PAN and Aadhaar</li>
      <li>Expired or invalid documents</li>
    </ul>
    <a href="http://localhost:3000/kyc" style="display:inline-block;margin-top:8px;background:#dc2626;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
      Re-submit KYC →
    </a>
    """
    await _send(to_email, "❌ KYC Rejected — LegalDoji", _base_template("KYC Verification Rejected", body))


async def send_account_suspended(to_email: str, name: str) -> None:
    body = f"""
    <p style="color:#374151;font-size:15px;line-height:1.6">Hi <strong>{name}</strong>,</p>
    <div style="background:#fffbeb;border-left:4px solid #d97706;border-radius:6px;padding:16px 20px;margin:20px 0">
      <p style="margin:0;color:#b45309;font-weight:600;font-size:15px">⚠️ Your account has been suspended.</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      Your LegalDoji account has been temporarily suspended by an administrator. You will not be able to log in until the suspension is lifted.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      If you believe this is a mistake, please contact our support team.
    </p>
    <a href="mailto:support@legaldoji.com" style="display:inline-block;margin-top:8px;background:#d97706;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
      Contact Support →
    </a>
    """
    await _send(to_email, "⚠️ Account Suspended — LegalDoji", _base_template("Account Suspended", body))


async def send_account_activated(to_email: str, name: str) -> None:
    body = f"""
    <p style="color:#374151;font-size:15px;line-height:1.6">Hi <strong>{name}</strong>,</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin:20px 0">
      <p style="margin:0;color:#15803d;font-weight:600;font-size:15px">✅ Your account has been activated!</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6">
      Great news! Your LegalDoji account has been reactivated. You can now log in and access all platform features.
    </p>
    <a href="http://localhost:3000/login" style="display:inline-block;margin-top:8px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
      Log In →
    </a>
    """
    await _send(to_email, "✅ Account Activated — LegalDoji", _base_template("Account Activated", body))
