from celery import Celery
from app.config import settings

celery_app = Celery(
    "spendwise",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.prediction_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.tasks.email_tasks.*": {"queue": "emails"},
        "app.tasks.notification_tasks.*": {"queue": "notifications"},
        "app.tasks.prediction_tasks.*": {"queue": "default"},
    },
    beat_schedule={
        "check-subscription-reminders": {
            "task": "app.tasks.notification_tasks.send_subscription_reminders",
            "schedule": 86400.0,  # daily
        },
        "run-nightly-predictions": {
            "task": "app.tasks.prediction_tasks.run_nightly_predictions",
            "schedule": 86400.0,  # daily
        },
    },
)
