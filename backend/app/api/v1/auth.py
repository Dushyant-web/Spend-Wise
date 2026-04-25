from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: DBSession) -> AuthResponse:
    return await AuthService(db).register(data)


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: DBSession) -> AuthResponse:
    return await AuthService(db).login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(data: RefreshTokenRequest, db: DBSession) -> TokenResponse:
    return await AuthService(db).refresh_tokens(data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: CurrentUser, db: DBSession) -> None:
    await AuthService(db).logout(current_user)
