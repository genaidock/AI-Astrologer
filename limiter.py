"""Shared rate limiter instance — imported by main.py and route modules."""

from starlette.requests import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_real_client_ip(request: Request) -> str:
    """
    Extract real client IP address, checking X-Forwarded-For first
    when running behind Coolify / Traefik / Docker reverse proxy.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=get_real_client_ip)

