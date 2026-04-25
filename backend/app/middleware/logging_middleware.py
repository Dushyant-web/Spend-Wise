import time
import uuid
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()

# Never log these paths verbosely (health checks, docs)
SILENT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in SILENT_PATHS:
            return await call_next(request)

        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        log = logger.bind(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            # Deliberately omit query params — may contain sensitive data
        )

        log.info("request_started")

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start) * 1000, 2)

            log.info(
                "request_completed",
                status_code=response.status_code,
                duration_ms=duration_ms,
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms}ms"
            return response

        except Exception as exc:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            log.error(
                "request_failed",
                duration_ms=duration_ms,
                error=type(exc).__name__,
            )
            raise
