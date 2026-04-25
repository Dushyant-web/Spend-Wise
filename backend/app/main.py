import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine
from app.models import Base
from app.redis_client import redis_client
from app.api.v1.router import api_router
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.core.exceptions import AppException

import structlog
import logging

structlog.configure(
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.DEBUG if settings.DEBUG else logging.INFO
    ),
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await redis_client.ping()
        logger.info("redis_connected", url=settings.REDIS_URL)
    except Exception as e:
        logger.error("redis_connection_failed", error=str(e))
        raise

    async with engine.begin() as conn:
        # In production use Alembic migrations — this is a dev convenience
        if settings.DEBUG:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("database_tables_ready")

    logger.info("spendwise_api_started", env=settings.APP_ENV, version=settings.APP_VERSION)
    yield

    # Shutdown
    await redis_client.aclose()
    await engine.dispose()
    logger.info("spendwise_api_stopped")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# CORS — strict allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(api_router, prefix="/api/v1")


# Global exception handler — never leak stack traces in production
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("unhandled_exception", error=type(exc).__name__, path=request.url.path)
    detail = str(exc) if settings.DEBUG else "An unexpected error occurred"
    return JSONResponse(status_code=500, content={"detail": detail})
