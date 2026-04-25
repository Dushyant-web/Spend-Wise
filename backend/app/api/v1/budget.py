from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetSchema,
    BudgetWithSpendingSchema,
    BudgetHistoryItem,
)
from app.services.budget_service import BudgetService
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/budget", tags=["budget"])


@router.post("", response_model=BudgetSchema, status_code=status.HTTP_201_CREATED)
async def set_budget(
    data: BudgetCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = BudgetService(db)
    budget = await svc.set_budget(current_user.id, data)
    return BudgetSchema.model_validate(budget)


@router.get("/current", response_model=BudgetWithSpendingSchema)
async def get_current_budget(
    db: DBSession,
    current_user: CurrentUser,
):
    expense_svc = ExpenseService(db)
    svc = BudgetService(db)
    return await svc.get_current_budget(current_user.id, expense_svc)


@router.put("/current", response_model=BudgetSchema)
async def update_budget(
    data: BudgetUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = BudgetService(db)
    budget = await svc.update_budget(current_user.id, data)
    return BudgetSchema.model_validate(budget)


@router.get("/history", response_model=list[BudgetHistoryItem])
async def get_budget_history(
    db: DBSession,
    current_user: CurrentUser,
    limit: int = Query(6, ge=1, le=12),
):
    expense_svc = ExpenseService(db)
    svc = BudgetService(db)
    return await svc.get_budget_history(current_user.id, expense_svc, limit)
