from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "SpendWise AI"
    APP_VERSION: str = "1.0.0"

    # Security
    SECRET_KEY: str = "change-this-to-a-256-bit-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database — Render gives postgres:// but asyncpg needs postgresql+asyncpg://
    DATABASE_URL: str = "postgresql+asyncpg://spendwise:spendwise_dev@localhost:5432/spendwise"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # NVIDIA NIM (OpenAI-compatible)
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL: str = "meta/llama-3.1-8b-instruct"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://spendwise.ai"]

    # Sentry
    SENTRY_DSN: str = ""

    # Rate limiting
    RATE_LIMIT_PUBLIC: int = 100       # requests per 15 min for unauthenticated
    RATE_LIMIT_AUTHENTICATED: int = 500  # requests per 15 min for authenticated


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
