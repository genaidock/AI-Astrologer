"""
Vedic Astrology Engine — powered by Kerykeion in Sidereal/Lahiri mode.

Computes natal charts, synastry, and current transits using the
Swiss Ephemeris with Lahiri Ayanamsa for authentic Jyotish calculations.
"""

import logging
from datetime import datetime, timezone
from typing import Any

from kerykeion import AstrologicalSubject, SynastryAspects, NatalAspects
from astro.vedic_chart import generate_north_indian_kundli_svg

logger = logging.getLogger(__name__)

# ── Vedic sign mapping (sidereal) ───────────────────────────────
VEDIC_SIGNS = {
    "Ari": "Mesha", "Tau": "Vrishabha", "Gem": "Mithuna",
    "Can": "Karka", "Leo": "Simha", "Vir": "Kanya",
    "Lib": "Tula", "Sco": "Vrischika", "Sag": "Dhanu",
    "Cap": "Makara", "Aqu": "Kumbha", "Pis": "Meena",
    # Full names from Kerykeion
    "Aries": "Mesha", "Taurus": "Vrishabha", "Gemini": "Mithuna",
    "Cancer": "Karka", "Leo": "Simha", "Virgo": "Kanya",
    "Libra": "Tula", "Scorpio": "Vrischika", "Sagittarius": "Dhanu",
    "Capricorn": "Makara", "Aquarius": "Kumbha", "Pisces": "Meena",
}

# ── Nakshatra mapping (27 nakshatras, ~13°20' each) ────────────
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]


def _to_vedic_sign(sign: str) -> str:
    """Convert a Western sign name to its Vedic Sanskrit equivalent."""
    return VEDIC_SIGNS.get(sign, sign)


def _get_nakshatra(abs_position: float) -> tuple[str, int]:
    """
    Compute Nakshatra and Pada from absolute sidereal longitude.
    Each nakshatra spans 13°20' (13.3333°), each pada 3°20' (3.3333°).
    """
    nakshatra_span = 360.0 / 27.0  # 13.3333°
    pada_span = nakshatra_span / 4.0  # 3.3333°

    nakshatra_index = int(abs_position / nakshatra_span) % 27
    pada = int((abs_position % nakshatra_span) / pada_span) + 1

    return NAKSHATRAS[nakshatra_index], min(pada, 4)


def _extract_planet(planet_obj: Any) -> dict:
    """Extract planet data from a Kerykeion planet object."""
    sign = getattr(planet_obj, "sign", "Unknown")
    abs_pos = getattr(planet_obj, "abs_pos", 0.0)
    nakshatra, pada = _get_nakshatra(abs_pos)

    return {
        "name": getattr(planet_obj, "name", "Unknown"),
        "sign": _to_vedic_sign(sign),
        "sign_num": getattr(planet_obj, "sign_num", 0),
        "position": round(getattr(planet_obj, "position", 0.0), 4),
        "abs_position": round(abs_pos, 4),
        "house": str(getattr(planet_obj, "house", "")),
        "retrograde": getattr(planet_obj, "retrograde", False),
        "nakshatra": nakshatra,
        "nakshatra_pada": pada,
    }


def _extract_house(house_obj: Any, number: int) -> dict:
    """Extract house data from a Kerykeion house object."""
    sign = getattr(house_obj, "sign", "Unknown")
    return {
        "number": number,
        "sign": _to_vedic_sign(sign),
        "sign_num": getattr(house_obj, "sign_num", 0),
        "position": round(getattr(house_obj, "position", 0.0), 4),
    }


def compute_natal_chart(
    name: str,
    year: int,
    month: int,
    day: int,
    hour: int = 0,
    minute: int = 0,
    city: str = "Mumbai",
    nation: str = "IN",
) -> dict:
    """
    Compute a full Vedic natal chart using Kerykeion in Sidereal/Lahiri mode.

    Returns a dictionary with planets, houses, aspects, and SVG chart.
    """
    logger.info(f"Computing Vedic natal chart for {name}: {year}-{month}-{day} {hour}:{minute}, {city}, {nation}")

    # Create subject with Sidereal zodiac + Lahiri Ayanamsa
    subject = AstrologicalSubject(
        name=name,
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        city=city,
        nation=nation,
        zodiac_type="Sidereal",
        sidereal_mode="LAHIRI",
    )

    # Extract planet data for the 9 Vedic grahas
    planet_names = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn",
    ]

    planets = []
    for pname in planet_names:
        pobj = getattr(subject, pname, None)
        if pobj:
            planets.append(_extract_planet(pobj))

    # Rahu (True North Lunar Node) — Kerykeion v5 attribute
    rahu_obj = getattr(subject, "true_north_lunar_node", None)
    if rahu_obj:
        rahu_data = _extract_planet(rahu_obj)
        rahu_data["name"] = "Rahu"
        rahu_data["retrograde"] = True  # Rahu is always retrograde
        planets.append(rahu_data)

    # Ketu (True South Lunar Node) — Kerykeion v5 attribute
    ketu_obj = getattr(subject, "true_south_lunar_node", None)
    if ketu_obj:
        ketu_data = _extract_planet(ketu_obj)
        ketu_data["name"] = "Ketu"
        ketu_data["retrograde"] = True  # Ketu is always retrograde
        planets.append(ketu_data)

    # Extract houses
    house_attrs = [
        "first_house", "second_house", "third_house", "fourth_house",
        "fifth_house", "sixth_house", "seventh_house", "eighth_house",
        "ninth_house", "tenth_house", "eleventh_house", "twelfth_house",
    ]
    houses = []
    for i, hattr in enumerate(house_attrs, 1):
        hobj = getattr(subject, hattr, None)
        if hobj:
            houses.append(_extract_house(hobj, i))

    # Extract aspects
    natal_aspects = NatalAspects(subject)
    aspects = []
    for aspect in natal_aspects.relevant_aspects:
        aspects.append({
            "p1_name": aspect.get("p1_name", ""),
            "p2_name": aspect.get("p2_name", ""),
            "aspect": aspect.get("aspect", ""),
            "orbit": round(aspect.get("orbit", 0.0), 4),
        })

    # Ascendant (Lagna)
    ascendant = _extract_planet(subject.first_house) if hasattr(subject, "first_house") else {}
    if ascendant:
        ascendant["name"] = "Lagna"

    # Build Authentic North Indian Vedic SVG chart
    svg_chart = None
    try:
        asc_sign_num = ascendant.get("sign_num", 0) if ascendant else 0
        svg_chart = generate_north_indian_kundli_svg(
            ascendant_sign_num=asc_sign_num,
            planets=planets,
            chart_title=f"{name}'s Janma Kundli",
        )
    except Exception as e:
        logger.warning(f"Could not generate Vedic SVG chart: {e}")

    return {
        "name": name,
        "birth_data": {
            "year": year, "month": month, "day": day,
            "hour": hour, "minute": minute,
            "city": city, "nation": nation,
        },
        "ascendant": ascendant,
        "sun": _extract_planet(subject.sun),
        "moon": _extract_planet(subject.moon),
        "planets": planets,
        "houses": houses,
        "aspects": aspects,
        "svg_chart": svg_chart,
    }


def compute_synastry(person1_data: dict, person2_data: dict) -> dict:
    """
    Compute synastry (compatibility) between two people.

    Each person_data should have: name, year, month, day, hour, minute, city, nation
    """
    subj1 = AstrologicalSubject(
        zodiac_type="Sidereal", sidereal_mode="LAHIRI", **person1_data
    )
    subj2 = AstrologicalSubject(
        zodiac_type="Sidereal", sidereal_mode="LAHIRI", **person2_data
    )

    syn = SynastryAspects(subj1, subj2)
    aspects = []
    for aspect in syn.relevant_aspects:
        aspects.append({
            "p1_name": aspect.get("p1_name", ""),
            "p2_name": aspect.get("p2_name", ""),
            "aspect": aspect.get("aspect", ""),
            "orbit": round(aspect.get("orbit", 0.0), 4),
        })

    # Reuse already-constructed subjects to build chart dicts — avoids a second
    # geonames lookup + ephemeris call per person that compute_natal_chart would trigger.
    chart1 = _chart_from_subject(subj1, person1_data)
    chart2 = _chart_from_subject(subj2, person2_data)

    return {
        "person1": chart1,
        "person2": chart2,
        "synastry_aspects": aspects,
    }


def _chart_from_subject(subject: AstrologicalSubject, birth_data: dict) -> dict:
    """Build a chart dict from an already-constructed AstrologicalSubject."""
    planet_names = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]
    planets = []
    for pname in planet_names:
        pobj = getattr(subject, pname, None)
        if pobj:
            planets.append(_extract_planet(pobj))

    rahu_obj = getattr(subject, "true_north_lunar_node", None)
    if rahu_obj:
        rahu_data = _extract_planet(rahu_obj)
        rahu_data["name"] = "Rahu"
        rahu_data["retrograde"] = True
        planets.append(rahu_data)

    ketu_obj = getattr(subject, "true_south_lunar_node", None)
    if ketu_obj:
        ketu_data = _extract_planet(ketu_obj)
        ketu_data["name"] = "Ketu"
        ketu_data["retrograde"] = True
        planets.append(ketu_data)

    house_attrs = [
        "first_house", "second_house", "third_house", "fourth_house",
        "fifth_house", "sixth_house", "seventh_house", "eighth_house",
        "ninth_house", "tenth_house", "eleventh_house", "twelfth_house",
    ]
    houses = []
    for i, hattr in enumerate(house_attrs, 1):
        hobj = getattr(subject, hattr, None)
        if hobj:
            houses.append(_extract_house(hobj, i))

    natal_aspects = NatalAspects(subject)
    aspect_list = []
    for aspect in natal_aspects.relevant_aspects:
        aspect_list.append({
            "p1_name": aspect.get("p1_name", ""),
            "p2_name": aspect.get("p2_name", ""),
            "aspect": aspect.get("aspect", ""),
            "orbit": round(aspect.get("orbit", 0.0), 4),
        })

    ascendant = _extract_planet(subject.first_house) if hasattr(subject, "first_house") else {}
    if ascendant:
        ascendant["name"] = "Lagna"

    svg_chart = None
    try:
        asc_sign_num = ascendant.get("sign_num", 0) if ascendant else 0
        svg_chart = generate_north_indian_kundli_svg(
            ascendant_sign_num=asc_sign_num,
            planets=planets,
            chart_title=f"{birth_data.get('name', '')}'s Janma Kundli",
        )
    except Exception as e:
        logger.warning(f"Could not generate Vedic SVG chart: {e}")

    return {
        "name": birth_data.get("name", ""),
        "birth_data": {
            "year": birth_data.get("year"), "month": birth_data.get("month"),
            "day": birth_data.get("day"), "hour": birth_data.get("hour"),
            "minute": birth_data.get("minute"), "city": birth_data.get("city"),
            "nation": birth_data.get("nation"),
        },
        "ascendant": ascendant,
        "sun": _extract_planet(subject.sun),
        "moon": _extract_planet(subject.moon),
        "planets": planets,
        "houses": houses,
        "aspects": aspect_list,
        "svg_chart": svg_chart,
    }


def get_current_transits(city: str = "Mumbai", nation: str = "IN") -> dict:
    """
    Get current planetary positions for transit analysis.
    """
    now = datetime.now(timezone.utc)
    transit_subject = AstrologicalSubject(
        name="Transit",
        year=now.year,
        month=now.month,
        day=now.day,
        hour=now.hour,
        minute=now.minute,
        city=city,
        nation=nation,
        zodiac_type="Sidereal",
        sidereal_mode="LAHIRI",
    )

    planets = []
    for pname in ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]:
        pobj = getattr(transit_subject, pname, None)
        if pobj:
            planets.append(_extract_planet(pobj))

    # Rahu
    rahu_obj = getattr(transit_subject, "true_north_lunar_node", None)
    if rahu_obj:
        rahu_data = _extract_planet(rahu_obj)
        rahu_data["name"] = "Rahu"
        rahu_data["retrograde"] = True
        planets.append(rahu_data)

    return {
        "timestamp": now.isoformat(),
        "planets": planets,
    }
