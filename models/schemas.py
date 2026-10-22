"""Pydantic schemas for request/response models."""

from pydantic import BaseModel, Field
from typing import Optional, Literal


# Valid Vedic sign names (Sanskrit)
VedicSign = Literal[
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena",
]


# ── Birth Details ────────────────────────────────────────────────
class BirthDetails(BaseModel):
    """Birth information required for chart computation."""
    name: str = Field(..., min_length=1, max_length=100, examples=["Arjun"])
    year: int = Field(..., ge=1900, le=2100, examples=[1995])
    month: int = Field(..., ge=1, le=12, examples=[4])
    day: int = Field(..., ge=1, le=31, examples=[15])
    hour: int = Field(0, ge=0, le=23, examples=[10])
    minute: int = Field(0, ge=0, le=59, examples=[30])
    city: str = Field(..., min_length=1, examples=["Mumbai"])
    nation: str = Field("IN", min_length=2, max_length=2, examples=["IN"])


# ── Planet Info ──────────────────────────────────────────────────
class PlanetInfo(BaseModel):
    """A single planet's placement in the chart."""
    name: str
    sign: str
    sign_num: int
    position: float
    abs_position: float
    house: Optional[str] = None
    retrograde: bool = False
    nakshatra: Optional[str] = None
    nakshatra_pada: Optional[int] = None


# ── House Info ───────────────────────────────────────────────────
class HouseInfo(BaseModel):
    """A single house cusp."""
    number: int
    sign: str
    sign_num: int
    position: float


# ── Aspect Info ──────────────────────────────────────────────────
class AspectInfo(BaseModel):
    """An aspect between two planets."""
    p1_name: str
    p2_name: str
    aspect: str
    orbit: float


# ── Chart Response ───────────────────────────────────────────────
class ChartResponse(BaseModel):
    """Full natal chart computation result."""
    name: str
    birth_data: dict
    ascendant: PlanetInfo
    sun: PlanetInfo
    moon: PlanetInfo
    planets: list[PlanetInfo]
    houses: list[HouseInfo]
    aspects: list[AspectInfo]
    svg_chart: Optional[str] = None


# ── Chat Models ──────────────────────────────────────────────────
class ChatMessage(BaseModel):
    """A single message in the conversation."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    """Chat request with conversation history and chart context."""
    messages: list[ChatMessage]
    chart_context: Optional[dict] = None
    birth_details: Optional[BirthDetails] = None
    model: Optional[str] = None


# ── Horoscope ────────────────────────────────────────────────────
class HoroscopeRequest(BaseModel):
    """Request for a horoscope reading."""
    sun_sign: VedicSign = Field(..., examples=["Mesha"])
    moon_sign: Optional[VedicSign] = Field(None, examples=["Vrishabha"])
    period: str = Field("daily", pattern="^(daily|weekly|monthly)$")
    model: Optional[str] = None


# ── Synastry ─────────────────────────────────────────────────────
class SynastryRequest(BaseModel):
    """Request for compatibility reading between two people."""
    person1: BirthDetails
    person2: BirthDetails
