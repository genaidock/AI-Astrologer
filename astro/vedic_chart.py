"""
Authentic North Indian Diamond Vedic Kundli SVG Generator.

Generates traditional Indian Vedic natal chart (Janma Kundli) in high-resolution SVG
with sacred gold styling, dynamic Lagna-based house rotation, Graha placement,
and Sanskrit & Roman nomenclature.
"""

from typing import Any


def generate_north_indian_kundli_svg(
    ascendant_sign_num: int,
    planets: list[dict[str, Any]],
    chart_title: str = "Vedic Janma Kundli",
    width: int = 500,
    height: int = 500,
) -> str:
    """
    Generate North Indian Diamond Chart (Lagna Kundli) SVG.

    Args:
        ascendant_sign_num: 0 (Mesha/Aries) .. 11 (Meena/Pisces)
        planets: List of dicts with 'name', 'sign_num', 'retrograde', 'position'
        chart_title: Title displayed at the top/center
        width: SVG viewport width
        height: SVG viewport height

    Returns:
        Clean SVG XML string.
    """
    # Map planets to houses based on ascendant (1-indexed house 1..12)
    house_planets: dict[int, list[dict]] = {i: [] for i in range(1, 13)}
    
    abbr_map = {
        "Sun": "Su", "Surya": "Su",
        "Moon": "Mo", "Chandra": "Mo",
        "Mars": "Ma", "Mangal": "Ma",
        "Mercury": "Me", "Budha": "Me",
        "Jupiter": "Ju", "Guru": "Ju",
        "Venus": "Ve", "Shukra": "Ve",
        "Saturn": "Sa", "Shani": "Sa",
        "Rahu": "Ra",
        "Ketu": "Ke",
        "Lagna": "Asc", "Ascendant": "Asc"
    }

    for p in planets:
        p_sign_num = p.get("sign_num", 0)
        h_num = ((p_sign_num - ascendant_sign_num + 12) % 12) + 1
        if h_num in house_planets:
            house_planets[h_num].append(p)

    # House geometries for 500x500 box
    # Outer box: (0,0) to (500,500)
    # 1: Top Diamond (250,0 125,125 250,250 375,125)
    # 2: Top-Left Triangle (0,0 250,0 125,125)
    # 3: Left-Top Triangle (0,0 125,125 0,250)
    # 4: Left Diamond (0,250 125,125 250,250 125,375)
    # 5: Left-Bottom Triangle (0,250 125,375 0,500)
    # 6: Bottom-Left Triangle (0,500 125,375 250,500)
    # 7: Bottom Diamond (250,500 125,375 250,250 375,375)
    # 8: Bottom-Right Triangle (250,500 375,375 500,500)
    # 9: Right-Bottom Triangle (500,500 375,375 500,250)
    # 10: Right Diamond (500,250 375,375 250,250 375,125)
    # 11: Right-Top Triangle (500,250 375,125 500,0)
    # 12: Top-Right Triangle (500,0 375,125 250,0)

    houses_def = [
        {
            "num": 1,
            "points": "250,0 125,125 250,250 375,125",
            "rashi_pos": (250, 155),
            "planet_pos": (250, 90),
            "name": "1 (Lagna / Tanu)",
        },
        {
            "num": 2,
            "points": "0,0 250,0 125,125",
            "rashi_pos": (145, 70),
            "planet_pos": (95, 45),
            "name": "2 (Dhana)",
        },
        {
            "num": 3,
            "points": "0,0 125,125 0,250",
            "rashi_pos": (75, 145),
            "planet_pos": (45, 95),
            "name": "3 (Sahaja)",
        },
        {
            "num": 4,
            "points": "0,250 125,125 250,250 125,375",
            "rashi_pos": (155, 250),
            "planet_pos": (90, 250),
            "name": "4 (Sukha)",
        },
        {
            "num": 5,
            "points": "0,250 125,375 0,500",
            "rashi_pos": (75, 355),
            "planet_pos": (45, 405),
            "name": "5 (Putra)",
        },
        {
            "num": 6,
            "points": "0,500 125,375 250,500",
            "rashi_pos": (145, 430),
            "planet_pos": (95, 455),
            "name": "6 (Ari / Ripu)",
        },
        {
            "num": 7,
            "points": "250,500 125,375 250,250 375,375",
            "rashi_pos": (250, 345),
            "planet_pos": (250, 410),
            "name": "7 (Yuvati / Jaya)",
        },
        {
            "num": 8,
            "points": "250,500 375,375 500,500",
            "rashi_pos": (355, 430),
            "planet_pos": (405, 455),
            "name": "8 (Randhra)",
        },
        {
            "num": 9,
            "points": "500,500 375,375 500,250",
            "rashi_pos": (425, 355),
            "planet_pos": (455, 405),
            "name": "9 (Dharma / Bhagya)",
        },
        {
            "num": 10,
            "points": "500,250 375,375 250,250 375,125",
            "rashi_pos": (345, 250),
            "planet_pos": (410, 250),
            "name": "10 (Karma)",
        },
        {
            "num": 11,
            "points": "500,250 375,125 500,0",
            "rashi_pos": (425, 145),
            "planet_pos": (455, 95),
            "name": "11 (Labha)",
        },
        {
            "num": 12,
            "points": "500,0 375,125 250,0",
            "rashi_pos": (355, 70),
            "planet_pos": (405, 45),
            "name": "12 (Vyaya)",
        },
    ]

    elements: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" class="north-indian-svg" style="background:#070712; border-radius:16px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); max-width:100%; height:auto;">',
        '  <defs>',
        '    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">',
        '      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>',
        '      <stop offset="50%" stop-color="#e8b84b" stop-opacity="1"/>',
        '      <stop offset="100%" stop-color="#d97706" stop-opacity="0.8"/>',
        '    </linearGradient>',
        '    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">',
        '      <feGaussianBlur stdDeviation="3" result="blur"/>',
        '      <feComposite in="SourceGraphic" in2="blur" operator="over"/>',
        '    </filter>',
        '  </defs>',
        f'  <rect width="{width}" height="{height}" fill="#0b0a1c" stroke="url(#goldBorder)" stroke-width="3" rx="10"/>',
    ]

    # Render house polygons, Rashi numbers, and Grahas
    for h in houses_def:
        h_num = h["num"]
        # In North Indian chart: Rashi number in House H is ((ascendant_sign_num + h_num - 1) % 12) + 1
        rashi_num = ((ascendant_sign_num + (h_num - 1)) % 12) + 1
        
        # House polygon
        elements.append(
            f'  <polygon points="{h["points"]}" fill="rgba(19, 18, 42, 0.65)" '
            f'stroke="#e8b84b" stroke-width="1.6" stroke-opacity="0.75" '
            f'class="kundli-house-poly" data-house="{h_num}"/>'
        )

        # Rashi number (displayed in small gold numerals)
        rx, ry = h["rashi_pos"]
        elements.append(
            f'  <text x="{rx}" y="{ry}" fill="#f59e0b" font-family="Cinzel, serif" '
            f'font-size="14" font-weight="700" text-anchor="middle" dominant-baseline="central" '
            f'opacity="0.85">{rashi_num}</text>'
        )

        # Resident Grahas
        res_planets = house_planets.get(h_num, [])
        if res_planets:
            px, py = h["planet_pos"]
            # Format planets into compact lines
            planet_tokens = []
            for p in res_planets:
                name = p.get("name", "")
                abbr = abbr_map.get(name, name[:2])
                retro = '<tspan fill="#f43f5e" font-weight="bold">℞</tspan>' if p.get("retrograde") else ''
                deg = f'{int(p.get("position", 0))}°' if "position" in p else ''
                planet_tokens.append(f'{abbr}{retro} <tspan font-size="9" fill="#a0a0c0">{deg}</tspan>')
            
            # If multiple planets, render vertically spaced
            num_tokens = len(planet_tokens)
            start_y = py - ((num_tokens - 1) * 7.5)
            for idx, token in enumerate(planet_tokens):
                cur_y = start_y + (idx * 15)
                elements.append(
                    f'  <text x="{px}" y="{cur_y}" fill="#ffffff" font-family="Plus Jakarta Sans, sans-serif" '
                    f'font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="central">{token}</text>'
                )

    # Center auspicious medallion
    elements.extend([
        '  <circle cx="250" cy="250" r="14" fill="#14132b" stroke="#e8b84b" stroke-width="1.8" filter="url(#goldGlow)"/>',
        '  <text x="250" y="250" fill="#e8b84b" font-family="Cinzel, serif" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="central">ॐ</text>',
        '</svg>',
    ])

    return "\n".join(elements)
