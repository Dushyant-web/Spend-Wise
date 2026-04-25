import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Query, status, UploadFile, File
from fastapi.responses import Response

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseSchema,
    PaginatedExpenseResponse,
    ImportCSVResponse,
)
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=PaginatedExpenseResponse)
async def list_expenses(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    payment_mode: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
):
    svc = ExpenseService(db)
    return await svc.list_expenses(
        user_id=current_user.id,
        page=page,
        per_page=per_page,
        category=category,
        payment_mode=payment_mode,
        search=search,
        date_from=date_from,
        date_to=date_to,
        month=month,
        year=year,
    )


@router.post("", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
async def create_expense(
    data: ExpenseCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = ExpenseService(db)
    expense = await svc.create_expense(current_user.id, data)
    return ExpenseSchema.model_validate(expense)


# Specific paths MUST come before /{expense_id} to avoid UUID match attempts
@router.get("/export/csv")
async def export_expenses_csv(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = ExpenseService(db)
    csv_data = await svc.export_csv(current_user.id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=spendwise_expenses.csv"},
    )


@router.post("/import/csv", response_model=ImportCSVResponse)
async def import_expenses_csv(
    db: DBSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
):
    content = await file.read()
    csv_text = content.decode("utf-8-sig")
    svc = ExpenseService(db)
    return await svc.import_csv(current_user.id, csv_text)


@router.get("/{expense_id}", response_model=ExpenseSchema)
async def get_expense(
    expense_id: uuid.UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = ExpenseService(db)
    expense = await svc.get_expense(current_user.id, expense_id)
    return ExpenseSchema.model_validate(expense)


@router.put("/{expense_id}", response_model=ExpenseSchema)
async def update_expense(
    expense_id: uuid.UUID,
    data: ExpenseUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = ExpenseService(db)
    expense = await svc.update_expense(current_user.id, expense_id, data)
    return ExpenseSchema.model_validate(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = ExpenseService(db)
    await svc.delete_expense(current_user.id, expense_id)
