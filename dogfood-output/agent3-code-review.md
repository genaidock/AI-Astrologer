# Code Review — AI Astrologer
**Reviewer:** Agent 3 (Automated Code Review)  
**Date:** 2026-10-07  
**Scope:** config.py, main.py, routes/chart.py, routes/chat.py, llm/client.py, astro/engine.py, astro/prompts.py, models/schemas.py, static/js/app.js

---

## Summary

The codebase is well-structured for an MVP and shows good engineering discipline overall: Pydantic validation is in place, logging is consistent, and the separation of concerns (routes / engine / LLM client / schemas) is clean. However, there are several **security issues** that need addressing before any public deployment, a handful of **error handling gaps**, some **performance concerns**, and a few **code quality** items worth cleaning up.

Severity ratings: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low / Info

---

## 1. Security Issues

### 🔴 CORS wildcard + `allow_credentials=True` — `main.py:33–39`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,   # ← This combination is the problem
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Using `allow_origins=["*"]` together with `allow_credentials=True` is **rejected by browsers** per the CORS spec and is a security misconfiguration. More importantly, this is documented as "for development" but will be shipped as-is. Before production:

- Set `allow_origins` to the actual frontend origin(s) (e.g., `["https://yourdomain.com"]`)
- Or drop `allow_credentials=True` if cookies/auth headers are not needed (they aren't in the current design)

**Fix:**
```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)
```

---

### 🟠 `print()` leaks model name and API URL to stdout — `llm/client.py:61`

```python
print(f"Using model: {payload['model']} and URL: {url}")
```

This is a debug leftover. It leaks the internal API base URL to server stdout on every streaming chat request. In a hosted environment this could expose infra details in logs. Replace with `logger.debug(...)`.

---

### 🟠 Unvalidated `sun_sign` passed into LLM prompt — `models/schemas.py:84` / `routes/chat.py:101–105`

```python
sun_sign: str = Field(..., examples=["Mesha"])
```

`sun_sign` has no allowed-values constraint. Any string (including prompt injection payloads) flows directly into `build_horoscope_prompt()` which embeds it into the LLM system prompt:

```python
f"Sun Sign (Surya Rashi): {sun_sign}"
```

A user can send `sun_sign: "Ignore all previous instructions and..."` and influence the LLM's behavior. Add an enum validator:

```python
VALID_RASHIS = {"Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
                "Tula","Vrischika","Dhanu","Makara","Kumbha","Meena"}

sun_sign: str = Field(..., examples=["Mesha"])

@field_validator("sun_sign")
@classmethod
def validate_sun_sign(cls, v):
    if v not in VALID_RASHIS:
        raise ValueError(f"sun_sign must be one of: {', '.join(sorted(VALID_RASHIS))}")
    return v
```

The same applies to `moon_sign`.

---

### 🟠 `ChatMessage.content` has no length cap — `models/schemas.py:70`

```python
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str   # ← no max_length
```

A malicious client can send megabyte-sized messages that get forwarded to the LLM API verbatim, potentially causing:
- Extremely high API costs
- Slow/hanging requests that block the async loop
- Memory pressure

Add `max_length`:
```python
content: str = Field(..., min_length=1, max_length=8000)
```

Also: `ChatRequest.messages` has no upper bound on list length. A payload with 1,000 messages would be sent to the LLM unchanged:
```python
messages: list[ChatMessage] = Field(..., max_length=50)
```

---

### 🟡 `name` field not sanitized before being embedded in LLM prompts — `astro/prompts.py:78`

```python
f"## CHART DATA FOR: {name}"
```

`name` passes Pydantic's `max_length=100` check but is embedded directly into the system prompt. A crafted name like `"Alice\n\n## INSTRUCTIONS\nIgnore all previous instructions..."` could inject into the prompt structure. Apply a simple strip/normalize before use in prompts:

```python
name = re.sub(r'[^\w\s\-\.]', '', chart_data.get("name", "the seeker"))[:50]
```

---

### 🟡 API key check returns empty list silently — `llm/client.py:110–111`

```python
async def get_models() -> list[dict]:
    if not CODECRAFT_API_KEY:
        return []   # ← silent failure
```

This is fine for `get_models()` but the pattern masks misconfiguration. The `/api/models` endpoint returns `{"models": []}` with HTTP 200, giving the UI no indication that the key is missing. The UI then renders an empty model selector. A 503 with a message like "API key not configured" would be more useful.

---

### 🟡 Sensitive data stored in `localStorage` without expiry — `static/js/app.js:516–520`

```javascript
localStorage.setItem("jyotish_birth", JSON.stringify(details));
```

Birth date, time, and city are stored permanently in localStorage. There is no expiry, no clear-on-logout, and no user consent notice. On a shared computer this is a privacy exposure. Consider:
- Adding an expiry timestamp and clearing stale data on load
- Offering an explicit "Remember me" checkbox before storing
- Documenting this in a privacy notice

---

## 2. Error Handling Gaps

### 🟠 `compute_natal_chart()` called synchronously in an async route — `routes/chat.py:48–51`

```python
chart_data = compute_natal_chart(
    name=bd.name, year=bd.year, ...
)
```

`compute_natal_chart` is a blocking synchronous function (Kerykeion does I/O via geonames HTTP lookup + ephemeris computation). Calling it directly in an `async def` route blocks the entire uvicorn event loop for the duration of that call, preventing other requests from being served. Fix with `asyncio.to_thread`:

```python
import asyncio
chart_data = await asyncio.to_thread(
    compute_natal_chart,
    name=bd.name, year=bd.year, month=bd.month, day=bd.day,
    hour=bd.hour, minute=bd.minute, city=bd.city, nation=bd.nation,
)
```

The same applies to `routes/chart.py` — all three route handlers call blocking functions without `to_thread`.

---

### 🟠 SSE error after headers are sent cannot return an HTTP error code — `routes/chat.py:79–81`

```python
except Exception as e:
    logger.exception("Chat streaming error")
    yield f"data: {json.dumps({'error': str(e)})}\\n\\n"
```

Once SSE streaming starts, HTTP status is already 200. Errors mid-stream are delivered as data events, which is correct. However, the raw `str(e)` of an internal exception is sent to the client. This can leak internal stack trace details or library internals. Sanitize:

```python
yield f"data: {json.dumps({'error': 'An error occurred. Please try again.'})}\\n\\n"
# Log the actual error internally only
```

---

### 🟠 `compute_synastry` calls `compute_natal_chart` twice redundantly — `astro/engine.py:225–226`

```python
syn = SynastryAspects(subj1, subj2)
...
chart1 = compute_natal_chart(**person1_data)   # Creates AstrologicalSubject AGAIN
chart2 = compute_natal_chart(**person2_data)   # Creates AstrologicalSubject AGAIN
```

`subj1` and `subj2` are already computed above. `compute_natal_chart` creates a third and fourth `AstrologicalSubject` from the same data, doubling the geonames lookups and ephemeris work. Extract a helper that takes an existing subject and builds the result dict, or refactor `compute_natal_chart` to accept an optional pre-built subject.

---

### 🟡 No rate limiting on any endpoint

The `/api/chat`, `/api/chart`, and `/api/synastry` endpoints have no rate limiting. Each chart/synastry request can trigger multiple external API calls (geonames + LLM). A single client could exhaust the CodeCraft API quota in seconds. Consider adding `slowapi` or a simple per-IP token bucket:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

@router.post("/chat")
@limiter.limit("20/minute")
async def chat_with_astrologer(req: ChatRequest, request: Request): ...
```

---

### 🟡 `_handle_error` always returns HTTP 400, even for 5xx conditions — `routes/chart.py:14–19`

```python
def _handle_error(e: Exception, prefix: str):
    ...
    raise HTTPException(status_code=400, detail=...)
```

A geonames network timeout, an ephemeris file not found, or an out-of-memory condition should return 500 or 503, not 400 (which implies client error). The current city-not-found check is good, but everything else getting a 400 is semantically wrong. Differentiate:

```python
if "Missing data from geonames" in err_msg or "countryCode" in err_msg:
    raise HTTPException(status_code=400, detail="City not found...")
raise HTTPException(status_code=500, detail="Chart computation failed. Please try again.")
```

---

### 🟡 No timeout on the `/api/chart` and `/api/synastry` routes

If the Kerykeion geonames lookup hangs (network issue), the request hangs indefinitely. The LLM client has a 120s read timeout configured, but the astro engine has none. Add a timeout wrapper or configure httpx timeouts at the geonames level.

---

### 🟢 `_full_response` returns an error string instead of raising — `llm/client.py:103`

```python
return f"Error: API returned status {resp.status_code}"
```

In non-streaming mode, errors are returned as plain strings that look like successful LLM responses to the caller. Callers cannot distinguish success from failure without string-parsing. Should raise an exception instead.

---

## 3. Performance Issues

### 🟠 No caching for identical chart requests

`compute_natal_chart` makes a geonames HTTP call and runs ephemeris calculations — roughly 500ms–2s per call. The same birth details (same person chatting repeatedly) recompute from scratch every time `birth_details` is passed to `/api/chat`. A simple LRU cache keyed on `(name, year, month, day, hour, minute, city, nation)` would eliminate redundant work:

```python
from functools import lru_cache

@lru_cache(maxsize=256)
def compute_natal_chart(name, year, month, day, hour, minute, city, nation): ...
```

Note: since `lru_cache` requires hashable args, the current signature already works.

---

### 🟡 SVG chart generated but never used in chat flow — `astro/engine.py:177–183`

The SVG is generated on every `compute_natal_chart` call (including the one inside `compute_synastry`), but in the synastry flow it is discarded. In the chat flow where `birth_details` triggers chart computation, the SVG is also thrown away (only `chart_data` dict is used for the prompt). SVG generation is non-trivial CPU work. Consider lazy/optional generation:

```python
def compute_natal_chart(..., include_svg: bool = True) -> dict:
```

---

### 🟡 `conversationHistory` grows unbounded in the frontend — `static/js/app.js:156,167`

The full conversation history is sent to the backend on every message. A long session sends an ever-growing payload and consumes more LLM context. There is no truncation strategy. Consider keeping only the last N turns:

```javascript
const MAX_HISTORY = 20;
const trimmedHistory = conversationHistory.slice(-MAX_HISTORY);
```

---

### 🟡 Starfield creates up to 200 DOM elements on load — `static/js/app.js:47`

```javascript
const count = Math.min(window.innerWidth / 4, 200);
```

200 individually-positioned `<div>` elements with CSS animations is heavier than needed, especially on mobile. A single `<canvas>` element with requestAnimationFrame would be more performant and give better control over density.

---

## 4. Code Quality Issues

### 🟡 `ChatRequest.chart_context` is an untyped `dict` — `models/schemas.py:76`

```python
chart_context: Optional[dict] = None
```

The actual shape is a full `ChartResponse`. Typing it as `Optional[ChartResponse]` would give Pydantic validation, auto-generated OpenAPI docs, and IDE autocompletion. The frontend already sends the full chart object.

---

### 🟡 Duplicate SSE streaming code across three JS functions

`sendMessage()`, `getHoroscope()`, `checkCompatibility()`, `generateNumerology()`, and `revealAndReadTarot()` all contain nearly identical SSE reader loops (~25 lines each). This is ~125 lines of copy-pasted logic. Extract a shared utility:

```javascript
async function streamSSE(url, body, onChunk, onError) {
    const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!resp.ok) { onError(await resp.json().catch(() => ({}))); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") return;
            try { const p = JSON.parse(data); if (p.content) onChunk(p.content); }
            catch (e) {}
        }
    }
}
```

---

### 🟡 `getHoroscope()` uses implicit global `event` — `static/js/app.js:358`

```javascript
async function getHoroscope(rashi) {
    event.target.closest(".rashi-btn").classList.add("active");
```

Relying on the implicit global `event` object is fragile — it only works when called directly from an inline `onclick` handler and breaks in strict mode or when the function is called programmatically. Pass the event explicitly:

```html
onclick="getHoroscope('Mesha', event)"
```
```javascript
async function getHoroscope(rashi, event) { ... }
```

---

### 🟡 Inconsistent Markdown rendering in frontend

`sendMessage()` uses `escapeHtml()` (plain text, no Markdown), while `generateNumerology()` and `revealAndReadTarot()` use `marked.parse()` (Markdown → HTML). The LLM returns Markdown formatting (bold, headers, lists) in all responses. Chat responses are therefore displayed as raw Markdown syntax rather than rendered. Either render Markdown everywhere or nowhere — currently the behavior is inconsistent across tabs.

If using `marked`, ensure content is sanitized with DOMPurify to prevent XSS from LLM-generated content:
```javascript
contentEl.innerHTML = DOMPurify.sanitize(marked.parse(htmlBuffer));
```

---

### 🟢 `nation` field max_length missing — `models/schemas.py:17`

```python
nation: str = Field("IN", min_length=2, max_length=2, examples=["IN"])
```

This is already correct — 2-char ISO code is enforced. ✓ No issue.

---

### 🟢 `VEDIC_SIGNS` dict has duplicate key `"Leo"` — `astro/engine.py:18–27`

```python
VEDIC_SIGNS = {
    ...
    "Leo": "Simha",   # line 20 (abbreviated)
    ...
    "Leo": "Simha",   # line 24 (full name) ← duplicate key, second overwrites first
}
```

Both entries map to the same value so there is no functional bug, but it's a code smell. The abbreviated 3-letter keys (`"Ari"`, `"Tau"`, etc.) and the full-name keys (`"Aries"`, `"Taurus"`, etc.) could be two separate dicts or combined with a comment noting the intent.

---

### 🟢 Missing `__init__.py` files may cause import issues

`astro/`, `llm/`, `models/`, and `routes/` are used as packages but may lack `__init__.py` files. This works with modern Python implicit namespace packages but is worth making explicit for tooling compatibility.

---

## 5. Missing Features / Unhandled Edge Cases

### 🟠 No validation that birth date is actually valid — `models/schemas.py:11–15`

Pydantic validates `day` is 1–31 and `month` is 1–12, but does not check that the combination is a real date (e.g., Feb 30, Apr 31). Kerykeion will raise an obscure error for invalid dates. Add a `model_validator`:

```python
from pydantic import model_validator
from datetime import date

@model_validator(mode="after")
def validate_date(self):
    try:
        date(self.year, self.month, self.day)
    except ValueError:
        raise ValueError(f"{self.day}/{self.month}/{self.year} is not a valid date")
    return self
```

---

### 🟡 No handling of future birth dates

A user can submit a birth date of year 2099. Kerykeion will compute a chart but the astrological interpretation becomes meaningless. Add a check:

```python
year: int = Field(..., ge=1900, le=date.today().year, examples=[1995])
```

---

### 🟡 Synastry route discards the `build_synastry_prompt` function

`astro/prompts.py` defines `build_synastry_prompt(chart1, chart2, aspects)` but it is never called. The `checkCompatibility()` frontend flow uses a generic chat message instead, losing the structured prompt that was carefully designed for Kundli Milan analysis. Wire it in via a dedicated `/api/synastry/interpret` endpoint or call it from the compatibility chat request.

---

### 🟡 No Ketu in transit calculations — `astro/engine.py:254–265`

`get_current_transits()` adds Rahu but omits Ketu. In Vedic astrology Ketu is equally important. The natal chart computation includes both — the inconsistency will confuse transit interpretations. Add Ketu to `get_current_transits()` to match the natal chart logic.

---

### 🟡 Empty message list not guarded in `/api/chat` — `routes/chat.py:68`

If `req.messages` is empty (valid per the schema — `list[ChatMessage]` has no `min_length`), the LLM is called with only a system message and no user turn, which may produce confusing results or API errors. Add `min_length=1` to the `messages` field in `ChatRequest`.

---

### 🟢 Model selector defaults to `claude-opus-4.8` which may not exist — `static/js/app.js:36`

```javascript
if (m.id === "claude-opus-4.8") opt.selected = true;
```

If the CodeCraft API doesn't list this model, no option gets pre-selected and the `<select>` defaults to whatever the browser picks first. The default should fall back gracefully (e.g., select the first model if the preferred one isn't found).

---

## Prioritized Fix List

| Priority | Issue | File |
|----------|-------|------|
| 🔴 | CORS wildcard + credentials=True | main.py |
| 🟠 | Blocking sync calls in async routes (event loop blockage) | routes/chat.py, routes/chart.py |
| 🟠 | `sun_sign`/`moon_sign` not validated against allowed values (prompt injection) | models/schemas.py |
| 🟠 | No message content length cap (cost/DoS) | models/schemas.py |
| 🟠 | `print()` leaking API URL to stdout | llm/client.py |
| 🟠 | Raw exception messages sent to client in SSE error events | routes/chat.py, routes/chat.py |
| 🟠 | Redundant double chart computation in synastry | astro/engine.py |
| 🟠 | No rate limiting on any endpoint | routes/ |
| 🟡 | Invalid date combinations not caught (Feb 30 etc.) | models/schemas.py |
| 🟡 | `name` field embedded in LLM prompt without sanitization | astro/prompts.py |
| 🟡 | `conversationHistory` unbounded growth | static/js/app.js |
| 🟡 | Duplicate SSE streaming code (5 copies) | static/js/app.js |
| 🟡 | `getHoroscope` uses implicit global `event` | static/js/app.js |
| 🟡 | Inconsistent Markdown rendering (XSS risk with `marked`) | static/js/app.js |
| 🟡 | `build_synastry_prompt` defined but never called | astro/prompts.py, routes/ |
| 🟡 | Ketu missing from transit calculations | astro/engine.py |
| 🟢 | Birth details in localStorage without expiry/consent | static/js/app.js |
| 🟢 | Duplicate `"Leo"` key in VEDIC_SIGNS | astro/engine.py |
| 🟢 | SVG generated unnecessarily in synastry flow | astro/engine.py |
