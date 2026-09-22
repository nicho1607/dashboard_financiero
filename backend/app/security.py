import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Agrega cabeceras de seguridad HTTP a todas las respuestas."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # Evita que el navegador adivine el tipo de contenido
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Evita que la página se cargue dentro de un iframe (clickjacking)
        response.headers["X-Frame-Options"] = "DENY"
        # Controla la información enviada en el header Referer
        response.headers["Referrer-Policy"] = "no-referrer"
        # Deshabilita APIs sensibles del navegador
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # Fuerza HTTPS en navegadores (solo tiene efecto sobre HTTPS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting simple en memoria por IP.
    Limita el número de peticiones por ventana de tiempo.
    Nota: para producción con múltiples instancias, usar Redis.
    """

    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Limpiar peticiones fuera de la ventana de tiempo
        timestamps = self.requests[client_ip]
        while timestamps and timestamps[0] < now - self.window_seconds:
            timestamps.popleft()

        if len(timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Demasiadas peticiones. Intenta más tarde."},
            )

        timestamps.append(now)
        return await call_next(request)
