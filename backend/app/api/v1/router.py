from fastapi import APIRouter
from app.api.v1 import auth, users, expenses, budget, analytics, notifications, insights, predictions, achievements, chat, admin, ai_coach

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(expenses.router)
api_router.include_router(budget.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)
api_router.include_router(insights.router)
api_router.include_router(predictions.router)
api_router.include_router(chat.router)
api_router.include_router(achievements.router)
api_router.include_router(admin.router)
api_router.include_router(ai_coach.router)


@api_router.get("/health", tags=["Health"])
async def health_check() -> dict:
    return {"status": "ok", "service": "SpendWise AI API", "version": "1.0.0"}
