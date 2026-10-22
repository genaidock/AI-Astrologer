# AI Astrologer Backend — API QA Report

**Agent:** Agent 2 (API-level QA)
**Date:** 2026-10-07T19:58:42Z
**Base URL:** http://localhost:8000

---

## Summary

All 4 primary endpoints are functional. 3 of 4 return correct data on happy-path requests. One **bug** was found: `POST /api/horoscope` rejects the documented field name `rashi` — the actual required field is `sun_sign`. Response times are acceptable except `GET /api/transits` which takes ~5.4s due to live ephemeris computation.

---

## Endpoint Results

### 1. GET /api/transits

| Property | Value |
|---|---|
| Status | ✅ 200 OK |
| Response Time | 5.39s |
| Planets Returned | 8 (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu) |

**Schema sample:**
```json
{
  "timestamp": "2026-10-07T19:57:25.657113+00:00",
  "planets": [
    {
      "name": "Sun",
      "sign": "Kanya",
      "sign_num": 5,
      "position": 20.107,
      "abs_position": 170.107,
      "house": "Sixth_House",
      "retrograde": false,
      "nakshatra": "Hasta",
      "nakshatra_pada": 4
    }
    // ... 7 more planets
  ]
}
```

**Notes:**
- Response is slow (~5.4s) — likely blocking on Swiss Ephemeris file I/O or live geolocation. Acceptable but worth caching.
- Venus is retrograde (`retrograde: true`) — correctly reflected.
- Timestamp is UTC ISO 8601. ✅
- Ketu is absent from the transits response (only 8 planets vs 9 in chart). This is consistent if the API intentionally omits Ketu from transits but includes it in natal charts — worth confirming with requirements.

---

### 2. POST /api/chart

| Property | Value |
|---|---|
| Status | ✅ 200 OK |
| Response Time | 0.27s |
| Input | `{"name":"Test User","year":1990,"month":3,"day":15,"hour":10,"minute":30,"city":"Mumbai","nation":"IN"}` |

**Schema verified:**
- `name` ✅
- `birth_data` object (mirrors input) ✅
- `ascendant` — name, sign, sign_num, position, abs_position, nakshatra, nakshatra_pada ✅
- `sun` — full planet object ✅
- `moon` — full planet object ✅
- `planets[]` — 9 planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu) ✅
- `houses[]` — 12 houses with sign and position ✅
- `aspects[]` — full list of planetary aspects with orbit orbs ✅
- `svg_chart` — embedded SVG birth chart (Lahiri ayanamsa, Placidus houses) ✅

**Data sanity:**
- Ascendant: Vrishabha (Taurus), Krittika nakshatra, pada 3 — matches 1990-03-15 10:30 IST Mumbai ✅
- Sun in Meena (Pisces), Purva Bhadrapada — correct for sidereal chart ✅
- Ayanamsa: Lahiri, Domification: Placidus — Vedic standard ✅

---

### 3. POST /api/horoscope

| Property | Value |
|---|---|
| Status | ⚠️ BUG — field name mismatch |
| Input as documented | `{"rashi":"Aries","period":"daily"}` → **422 Unprocessable Entity** |
| Input with correct field | `{"sun_sign":"Aries","period":"daily"}` → **200 OK (SSE stream)** |
| Response Time (correct input) | Streaming — first token ~0.2s |

**Bug detail:**

The task specification and likely frontend documentation use `rashi` as the field name, but the Pydantic model requires `sun_sign`. The API returns a clear 422 validation error:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "sun_sign"],
      "msg": "Field required",
      "input": {"rashi": "Aries", "period": "daily"}
    }
  ]
}
```

**When called correctly (`sun_sign`):**
- Returns an SSE stream (`text/event-stream`)
- Each chunk: `data: {"content": "..."}`
- Content is Vedic horoscope text in English referencing Mesha Rashi (Aries), ruling planet, etc. ✅
- Stream terminates correctly

**Recommendation:** Either rename the Pydantic field to `rashi` to match the documented API contract, or update all client-side references to use `sun_sign`.

---

### 4. POST /api/synastry

| Property | Value |
|---|---|
| Status | ✅ 200 OK |
| Response Time | 0.94s |
| Input | person1: Alice (1990-03-15, Mumbai) / person2: Bob (1988-07-22, Delhi) |

**Schema verified:**
- `person1` — full chart object identical to `/api/chart` response ✅
- `person2` — full chart object ✅  
- `synastry_aspects[]` — cross-chart aspects with `p1_name`, `p2_name`, `aspect`, `orbit` ✅

**Data sample:**
```json
{
  "synastry_aspects": [
    {"p1_name": "Sun", "p2_name": "Sun", "aspect": "trine", "orbit": 5.4232},
    {"p1_name": "Moon", "p2_name": "Moon", "aspect": "conjunction", "orbit": 3.5253},
    {"p1_name": "Mars", "p2_name": "Moon", "aspect": "square", "orbit": 0.1198}
  ]
}
```

- 100+ synastry aspects returned — comprehensive ✅
- Both natal charts include full SVG charts ✅

---

## Error Handling Tests

| Test | Input | Expected | Actual | Pass? |
|---|---|---|---|---|
| Missing required fields — `/api/chart` | `{}` | 422 | 422, lists all 5 missing fields | ✅ |
| Partial fields — `/api/chart` | `{"name":"Test"}` | 422 | 422, lists missing year/month/day/city | ✅ |
| Out-of-range month — `/api/chart` | `month: 99` | 422 | 422, "Input should be less than or equal to 12" | ✅ |
| Invalid city/nation — `/api/chart` | `city:"Nowhere", nation:"XX"` | 4xx | 400, "City not found" with helpful message | ✅ |
| Missing `person2` — `/api/synastry` | only `person1` | 422 | 422, "Field required" for person2 | ✅ |
| Wrong field name — `/api/horoscope` | `{"rashi":"Aries"}` | 200 | 422, requires `sun_sign` | ⚠️ BUG |

---

## Response Time Summary

| Endpoint | Response Time | Assessment |
|---|---|---|
| GET /api/transits | 5.39s | 🟡 Slow — ephemeris I/O; consider caching |
| POST /api/chart | 0.27s | 🟢 Fast |
| POST /api/synastry | 0.94s | 🟢 Acceptable (2 charts + cross-aspects) |
| POST /api/horoscope | streaming | 🟢 First token fast |

---

## Issues Found

### 🐛 BUG-1 — `/api/horoscope` field name mismatch (Severity: Medium)

- **Endpoint:** `POST /api/horoscope`
- **Expected field:** `rashi` (as documented/described)
- **Actual required field:** `sun_sign`
- **Impact:** Any client or documentation using `rashi` will get a 422 error silently
- **Fix:** Rename Pydantic model field from `sun_sign` to `rashi`, or add `rashi` as an alias

### ⚠️ OBSERVATION-1 — `/api/transits` slow response

- **Endpoint:** `GET /api/transits`
- **Time:** 5.39s
- **Cause:** Live ephemeris computation on every request
- **Recommendation:** Cache result with a 5–10 minute TTL; planetary positions don't change on a per-second basis

### ℹ️ OBSERVATION-2 — Ketu absent from `/api/transits`

- `/api/chart` returns 9 planets including Ketu
- `/api/transits` returns 8 planets, Ketu omitted
- If intentional, this should be documented; if not, Ketu should be added

---

## Schema Consistency

All planet objects are consistent across endpoints:
```json
{
  "name": "string",
  "sign": "string (Sanskrit name)",
  "sign_num": "integer (0-11)",
  "position": "float (degrees within sign)",
  "abs_position": "float (0-360)",
  "house": "string (e.g. Eleventh_House)",
  "retrograde": "boolean | null",
  "nakshatra": "string",
  "nakshatra_pada": "integer (1-4)"
}
```

FastAPI's validation errors are well-structured (RFC 7807-style with `loc`, `type`, `msg`) ✅

---

*Report generated by Agent 2 — API QA subagent*
