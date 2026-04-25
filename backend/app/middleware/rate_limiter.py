import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.redis_client import redis_client
from app.config import settings

WINDOW_SECONDS = 900  # 15 minutes

PUBLIC_LIMIT = settings.RATE_LIMIT_PUBLIC
AUTH_LIMIT = settings.RATE_LIMIT_AUTHENTICATED

# Paths that don't require auth — use stricter public limit
PUBLIC_PREFIXES = ("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/google")


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        is_public = any(path.startswith(p) for p in PUBLIC_PREFIXES)
        limit = PUBLIC_LIMIT if is_public else AUTH_LIMIT

        key = f"rate_limit:{client_ip}:{path.split('/')[3] if len(path.split('/')) > 3 else 'root'}"
        window_key = f"{key}:{int(time.time() // WINDOW_SECONDS)}"

        try:
            current = await redis_client.incr(window_key)
            if current == 1:
                await redis_client.expire(window_key, WINDOW_SECONDS)

            if current > limit:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many requests. Please try again later.",
                        "retry_after": WINDOW_SECONDS,
                    },
                    headers={"Retry-After": str(WINDOW_SECONDS)},
                )

            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
            return response

        except Exception:
            # Redis unavailable — fail open (don't block traffic)
            return await call_next(request)
