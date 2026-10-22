"""Chart computation API routes."""

import asyncio
import logging
import time
from datetime import date
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from models.schemas import BirthDetails, SynastryRequest
from astro.engine import compute_natal_chart, compute_synastry, get_current_transits
from limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chart"])

# Simple in-process TTL cache for /api/transits (60s TTL)
_transits_cache: dict[str, Any] = {}
_TRANSITS_TTL = 60  # seconds


def _validate_date(year: int, month: int, day: int):
    """Raise HTTPException if the calendar date is not real (e.g. Feb 30)."""
    try:
        date(year, month, day)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid date: {year}-{month:02d}-{day:02d}")


def _handle_error(e: Exception, prefix: str):
    logger.exception(prefix)
    err_msg = str(e)
    if "Missing data from geonames" in err_msg or "countryCode" in err_msg:
        err_msg = "City not found. Please try entering a nearby major city or district."
    raise HTTPException(status_code=400, detail=f"{prefix}: {err_msg}")


@router.post("/chart")
@limiter.limit("20/minute")
async def create_chart(birth: BirthDetails, request: Request):
    """Compute a full Vedic natal chart (Kundli)."""
    _validate_date(birth.year, birth.month, birth.day)
    try:
        chart = await asyncio.to_thread(
            compute_natal_chart,
            name=birth.name, year=birth.year, month=birth.month, day=birth.day,
            hour=birth.hour, minute=birth.minute, city=birth.city, nation=birth.nation,
        )
        return chart
    except Exception as e:
        _handle_error(e, "Chart computation failed")


@router.post("/synastry")
@limiter.limit("10/minute")
async def create_synastry(req: SynastryRequest, request: Request):
    """Compute compatibility / Kundli Milan between two people."""
    _validate_date(req.person1.year, req.person1.month, req.person1.day)
    _validate_date(req.person2.year, req.person2.month, req.person2.day)
    try:
        p1 = req.person1.model_dump()
        p2 = req.person2.model_dump()
        result = await asyncio.to_thread(compute_synastry, p1, p2)
        return result
    except Exception as e:
        _handle_error(e, "Synastry computation failed")


@router.get("/transits")
@limiter.limit("30/minute")
async def current_transits(request: Request, city: str = "Mumbai", nation: str = "IN"):
    """Get current planetary transit positions (Gochar). Cached for 60s."""
    cache_key = f"{city}:{nation}"
    now = time.monotonic()
    cached = _transits_cache.get(cache_key)
    if cached and (now - cached["ts"]) < _TRANSITS_TTL:
        logger.debug("Serving transits from cache for %s", cache_key)
        return cached["data"]
    try:
        result = await asyncio.to_thread(get_current_transits, city=city, nation=nation)
        _transits_cache[cache_key] = {"data": result, "ts": now}
        return result
    except Exception as e:
        _handle_error(e, "Transit computation failed")
