from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.auth import MessageResponse
from app.schemas.user import (
    ChangePasswordRequest,
    DeleteAccountRequest,
    OnboardingRequest,
    OnboardingResponse,
    UpdateUserRequest,
    UserSchema,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: CurrentUser, db: DBSession) -> UserSchema:
    return await UserService(db).get_me(current_user.id)


@router.put("/me", response_model=UserSchema)
async def update_me(
    data: UpdateUserRequest, current_user: CurrentUser, db: DBSession
) -> UserSchema:
    return await UserService(db).update_me(current_user, data)


@router.post("/me/onboarding", response_model=OnboardingResponse)
async def complete_onboarding(
    data: OnboardingRequest, current_user: CurrentUser, db: DBSession
) -> OnboardingResponse:
    return await UserService(db).complete_onboarding(current_user, data)


@router.post("/me/change-password", response_model=MessageResponse)
async def change_password(
    data: ChangePasswordRequest, current_user: CurrentUser, db: DBSession
) -> MessageResponse:
    await UserService(db).change_password(current_user, data)
    return MessageResponse(message="Password changed successfully")


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    data: DeleteAccountRequest, current_user: CurrentUser, db: DBSession
) -> None:
    await UserService(db).delete_me(current_user, data)
