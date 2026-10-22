"""
Async client for CodeCraft API — OpenAI-compatible chat completions.

Supports both streaming (SSE) and non-streaming modes.
"""

import json
import logging
from typing import AsyncGenerator

import httpx

from config import CODECRAFT_API_KEY, CODECRAFT_API_BASE, CODECRAFT_MODEL

logger = logging.getLogger(__name__)

# Timeout: 30s connect, 120s read (LLM responses can be slow)
TIMEOUT = httpx.Timeout(30.0, read=120.0)


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    stream: bool = True,
    temperature: float = 0.8,
    max_tokens: int = 2048,
) -> AsyncGenerator[str, None] | str:
    """
    Call CodeCraft API chat completions endpoint.

    Args:
        messages: List of {"role": ..., "content": ...} dicts
        model: Model ID (defaults to config CODECRAFT_MODEL)
        stream: If True, yields chunks as an async generator
        temperature: Creativity control (0.0–2.0)
        max_tokens: Max response length

    Returns:
        Async generator of text chunks (stream=True) or full text (stream=False)
    """
    if not CODECRAFT_API_KEY:
        raise ValueError(
            "CODECRAFT_API_KEY is not set. "
            "Copy .env.example to .env and add your key."
        )

    url = f"{CODECRAFT_API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {CODECRAFT_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model or CODECRAFT_MODEL,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if stream:
        logger.debug(f"Using model: {payload['model']} and URL: {url}")
        return _stream_response(url, headers, payload)
    else:
        return await _full_response(url, headers, payload)


async def _stream_response(
    url: str, headers: dict, payload: dict
) -> AsyncGenerator[str, None]:
    """Stream SSE chunks from the API."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as resp:
            if resp.status_code != 200:
                body = await resp.aread()
                logger.error(f"CodeCraft API error {resp.status_code}: {body.decode()}")
                yield f"Error: API returned status {resp.status_code}"
                return

            async for line in resp.aiter_lines():
                if not line.strip():
                    continue
                if line.startswith("data: "):
                    data = line[6:]
                    if data.strip() == "[DONE]":
                        return
                    try:
                        chunk = json.loads(data)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue


async def _full_response(url: str, headers: dict, payload: dict) -> str:
    """Get full (non-streaming) response from the API."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code != 200:
            logger.error(f"CodeCraft API error {resp.status_code}: {resp.text}")
            return f"Error: API returned status {resp.status_code}"

        data = resp.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")

async def get_models() -> list[dict]:
    """Fetch available models from CodeCraft API catalog."""
    if not CODECRAFT_API_KEY:
        return []
        
    url = f"{CODECRAFT_API_BASE}/models"
    headers = {"Authorization": f"Bearer {CODECRAFT_API_KEY}"}
    
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 200:
            return resp.json().get("data", [])
        return []
