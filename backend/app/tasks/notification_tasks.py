from app.celery_app import celery_app


@celery_app.task(name="app.tasks.notification_tasks.send_subscription_reminders", queue="notifications")
def send_subscription_reminders() -> dict:
    # Phase 8 implements this fully
    return {"status": "ok"}
