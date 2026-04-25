import asyncio
from datetime import date

from app.celery_app import celery_app

import structlog

log = structlog.get_logger()


@celery_app.task(name="app.tasks.prediction_tasks.run_nightly_predictions", queue="default")
def run_nightly_predictions() -> dict:
    """Nightly task: refresh predictions for all active users who have data."""
    return asyncio.run(_run())


async def _run() -> dict:
    from sqlalchemy import select
    from app.database import AsyncSessionLocal
    from app.models.user import User
    from app.services.prediction_service import PredictionService

    processed = 0
    errors = 0

    async with AsyncSessionLocal() as db:
        q = select(User.id).where(User.is_active == True)
        user_ids = (await db.execute(q)).scalars().all()

        for user_id in user_ids:
            try:
                svc = PredictionService(db)
                await svc.get_predictions(user_id)
                processed += 1
            except Exception as e:
                log.error("prediction_task_failed", user_id=str(user_id), error=str(e))
                errors += 1

    log.info("nightly_predictions_done", processed=processed, errors=errors)
    return {"processed": processed, "errors": errors}
