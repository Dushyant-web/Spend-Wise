import structlog
from app.config import settings

logger = structlog.get_logger()


class EmailService:
    async def send_welcome(self, email: str, name: str) -> None:
        subject = "Welcome to SpendWise AI 🎉"
        body = f"""
Hi {name},

Welcome to SpendWise AI — your money is finally intelligent.

Start tracking your expenses and let AI help you save more.

Cheers,
The SpendWise Team
        """.strip()
        await self._send(email, subject, body)

    async def send_password_reset(self, email: str, name: str, reset_link: str) -> None:
        subject = "Reset your SpendWise AI password"
        body = f"""
Hi {name},

We received a request to reset your password.

Click the link below to set a new password (valid for 1 hour):
{reset_link}

If you didn't request this, you can safely ignore this email.

Cheers,
The SpendWise Team
        """.strip()
        await self._send(email, subject, body)

    async def _send(self, to: str, subject: str, body: str) -> None:
        if not settings.MAIL_USERNAME:
            # Dev mode: print to logs instead of sending
            logger.info("email_skipped_no_smtp", to=to, subject=subject, body=body)
            return

        try:
            from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
            conf = ConnectionConfig(
                MAIL_USERNAME=settings.MAIL_USERNAME,
                MAIL_PASSWORD=settings.MAIL_PASSWORD,
                MAIL_FROM=settings.MAIL_FROM,
                MAIL_PORT=settings.MAIL_PORT,
                MAIL_SERVER=settings.MAIL_SERVER,
                MAIL_STARTTLS=settings.MAIL_TLS,
                MAIL_SSL_TLS=settings.MAIL_SSL,
                USE_CREDENTIALS=True,
            )
            message = MessageSchema(
                subject=subject,
                recipients=[to],
                body=body,
                subtype=MessageType.plain,
            )
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info("email_sent", to=to, subject=subject)
        except Exception as e:
            logger.error("email_send_failed", to=to, error=str(e))
