"""Chat and horoscope API routes with SSE streaming."""

import asyncio
import json
import logging
import re

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest, HoroscopeRequest
from astro.engine import compute_natal_chart
from astro.prompts import (
    build_astrologer_system_prompt,
    build_horoscope_prompt,
    build_synastry_prompt,
)
from llm.client import chat_completion, get_models
from limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])

# Maximum number of conversation turns kept in context (user+assistant pairs)
_MAX_HISTORY_TURNS = 20
# Maximum characters allowed in a single message
_MAX_MESSAGE_CHARS = 4000


def _sanitize_text(text: str) -> str:
    """
    Strip characters that could be used to inject prompt delimiters or
    markdown headings that confuse the LLM system prompt structure.
    Keeps all normal Unicode text, punctuation, and emojis.
    """
    # Remove null bytes and ASCII control characters (except newline/tab)
    text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]", "", text)
    # Collapse runs of 4+ hashes (markdown H4+) to prevent prompt-injection via headings
    text = re.sub(r"#{4,}", "###", text)
    return text.strip()


def _trim_history(messages: list) -> list:
    """Keep only the most recent _MAX_HISTORY_TURNS pairs to cap context size."""
    # Always preserve system messages; trim oldest user/assistant pairs first
    non_system = [m for m in messages if m["role"] != "system"]
    system = [m for m in messages if m["role"] == "system"]
    if len(non_system) > _MAX_HISTORY_TURNS * 2:
        non_system = non_system[-((_MAX_HISTORY_TURNS * 2)):]
    return system + non_system


@router.get("/models")
@limiter.limit("30/minute")
async def list_models(request: Request):
    """Get all available models from CodeCraft API."""
    try:
        models = await get_models()
        return {"models": models}
    except Exception as e:
        logger.exception("Failed to fetch models")
        raise HTTPException(status_code=500, detail="Failed to fetch models")


@router.post("/chat")
@limiter.limit("30/minute")
async def chat_with_astrologer(req: ChatRequest, request: Request):
    """
    Chat with the AI Jyotish Astrologer.

    Streams the LLM response as Server-Sent Events (SSE).
    If chart_context is provided, it's embedded in the system prompt.
    If birth_details are provided but no chart_context, the chart is computed first.
    """
    messages = []

    # Build system prompt with chart context
    chart_data = req.chart_context
    if not chart_data and req.birth_details:
        bd = req.birth_details
        # Kerykeion is synchronous/CPU-bound — run in a thread to avoid blocking the event loop
        chart_data = await asyncio.to_thread(
            compute_natal_chart,
            name=bd.name, year=bd.year, month=bd.month, day=bd.day,
            hour=bd.hour, minute=bd.minute, city=bd.city, nation=bd.nation,
        )

    if chart_data:
        system_prompt = build_astrologer_system_prompt(chart_data)
    else:
        system_prompt = (
            "You are Jyotish Guru, a wise and compassionate Vedic astrologer. "
            "The user has not yet provided their birth details. "
            "Warmly greet them and ask for their birth date, time, and place "
            "to generate their Kundli (Vedic birth chart). "
            "Use Vedic astrology terminology with English explanations. "
            "Be warm, wise, and use celestial emojis (🌙 ☀️ ⭐ 🪐 ✨ 🔮). "
            "Respond directly and warmly without internal reasoning tags or thinking steps."
        )

    messages.append({"role": "system", "content": system_prompt})

    # Sanitize and add conversation history, then trim to cap context size
    for msg in req.messages:
        messages.append({"role": msg.role, "content": _sanitize_text(msg.content)})
    messages = _trim_history(messages)

    # Stream response
    async def event_generator():
        try:
            stream = await chat_completion(messages, model=req.model, stream=True)
            async for chunk in stream:
                # SSE format
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("Chat streaming error")
            yield f"data: {json.dumps({'error': f'{type(e).__name__}: {str(e)}'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/horoscope")
@limiter.limit("20/minute")
async def get_horoscope(req: HoroscopeRequest, request: Request):
    """
    Generate a Vedic horoscope (Rashifal) for a given sign and period.

    Returns streamed SSE response.
    """
    prompt = build_horoscope_prompt(
        sun_sign=req.sun_sign,
        moon_sign=req.moon_sign,
        period=req.period,
    )

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Please give me my {req.period} Vedic horoscope for {req.sun_sign}."},
    ]

    async def event_generator():
        try:
            stream = await chat_completion(messages, model=req.model, stream=True)
            async for chunk in stream:
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("Horoscope streaming error")
            yield f"data: {json.dumps({'error': f'{type(e).__name__}: {str(e)}'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
