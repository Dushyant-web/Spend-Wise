from app.celery_app import celery_app


@celery_app.task(name="app.tasks.email_tasks.send_welcome_email", queue="emails")
def send_welcome_email(user_id: str, email: str, name: str) -> dict:
    from app.services.email_service import EmailService
    import asyncio
    asyncio.run(EmailService().send_welcome(email, name))
    return {"status": "sent", "user_id": user_id}


@celery_app.task(name="app.tasks.email_tasks.send_password_reset_email", queue="emails")
def send_password_reset_email(email: str, name: str, reset_link: str) -> dict:
    from app.services.email_service import EmailService
    import asyncio
    asyncio.run(EmailService().send_password_reset(email, name, reset_link))
    return {"status": "sent", "email": email}
