"""
Async client for LLM APIs (Ollama, CodeCraft, OpenAI-compatible).

Supports both streaming (SSE) and non-streaming modes.
"""

import json
import logging
from typing import AsyncGenerator

import httpx

from config import (
    LLM_API_KEY,
    LLM_API_BASE,
    LLM_MODEL,
    LLM_THINK,
    LLM_TIMEOUT,
)

logger = logging.getLogger(__name__)

# Configurable timeout: 30s connect, LLM_TIMEOUT (default 300s) read
TIMEOUT = httpx.Timeout(30.0, read=LLM_TIMEOUT)


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    stream: bool = True,
    temperature: float = 0.8,
    max_tokens: int = 2048,
) -> AsyncGenerator[str, None] | str:
    """
    Call OpenAI-compatible chat completions endpoint (Ollama, CodeCraft, OpenAI).

    Args:
        messages: List of {"role": ..., "content": ...} dicts
        model: Model ID (defaults to config LLM_MODEL)
        stream: If True, yields chunks as an async generator
        temperature: Creativity control (0.0–2.0)
        max_tokens: Max response length

    Returns:
        Async generator of text chunks (stream=True) or full text (stream=False)
    """
    url = f"{LLM_API_BASE}/chat/completions"
    headers = {
        "Content-Type": "application/json",
    }
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    target_model = model or LLM_MODEL

    payload = {
        "model": target_model,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    # Ollama reasoning/thinking control:
    # When LLM_THINK is False, suppress internal reasoning to ensure fast ~5-15s generation
    is_ollama = "11434" in LLM_API_BASE or "ollama" in LLM_API_BASE.lower()
    if is_ollama:
        payload["options"] = {"temperature": temperature}
        if not LLM_THINK:
            payload["think"] = False

    logger.debug(f"Calling LLM: model={target_model}, url={url}, stream={stream}")

    if stream:
        return _stream_response(url, headers, payload)
    else:
        return await _full_response(url, headers, payload)


def _get_candidate_urls(url: str) -> list[str]:
    """
    Return candidate URLs to attempt.
    If URL points to host.docker.internal, include 172.17.0.1 as an automatic
    Docker bridge gateway fallback for Linux environments.
    """
    candidates = [url]
    if "host.docker.internal" in url:
        candidates.append(url.replace("host.docker.internal", "172.17.0.1"))
    return candidates


async def _stream_response(
    url: str, headers: dict, payload: dict
) -> AsyncGenerator[str, None]:
    """Stream SSE chunks from the API with automatic gateway fallback."""
    candidate_urls = _get_candidate_urls(url)
    
    for attempt_idx, candidate_url in enumerate(candidate_urls):
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                async with client.stream("POST", candidate_url, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        logger.error(f"LLM API error {resp.status_code}: {body.decode(errors='replace')}")
                        yield f"Error: LLM API returned status {resp.status_code}"
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
                return
            except httpx.ConnectError:
                if attempt_idx < len(candidate_urls) - 1:
                    logger.warning(f"Connection to {candidate_url} failed; trying fallback {candidate_urls[attempt_idx + 1]}")
                    continue
                logger.error(f"Cannot connect to LLM server at {candidate_url}. Is Ollama or the API service running?")
                yield "Error: Could not connect to the AI model server. Please verify the Ollama endpoint is running."
                return
            except httpx.ReadTimeout:
                logger.error(f"LLM request timed out after {LLM_TIMEOUT}s at {candidate_url}")
                yield "Error: The model took too long to respond. Please try again."
                return


async def _full_response(url: str, headers: dict, payload: dict) -> str:
    """Get full (non-streaming) response from the API with automatic gateway fallback."""
    candidate_urls = _get_candidate_urls(url)
    
    for attempt_idx, candidate_url in enumerate(candidate_urls):
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                resp = await client.post(candidate_url, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"LLM API error {resp.status_code}: {resp.text}")
                    return f"Error: LLM API returned status {resp.status_code}"

                data = resp.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "")
            except httpx.ConnectError:
                if attempt_idx < len(candidate_urls) - 1:
                    logger.warning(f"Connection to {candidate_url} failed; trying fallback {candidate_urls[attempt_idx + 1]}")
                    continue
                logger.error(f"Cannot connect to LLM server at {candidate_url}")
                return "Error: Could not connect to the AI model server."
            except httpx.ReadTimeout:
                logger.error(f"LLM request timed out at {candidate_url}")
                return "Error: Request to AI model timed out."



async def get_models() -> list[dict]:
    """
    Fetch available models from Ollama / OpenAI-compatible / CodeCraft API catalog.
    Falls back gracefully to the configured default model if endpoint is unavailable.
    """
    url = f"{LLM_API_BASE}/models"
    headers = {}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json().get("data", [])
                if data:
                    return [
                        {
                            "id": m.get("id"),
                            "display_name": m.get("name") or m.get("id"),
                        }
                        for m in data
                        if m.get("id")
                    ]
            
            # If /v1/models fails or is empty, try Ollama native /api/tags
            if "11434" in LLM_API_BASE or "ollama" in LLM_API_BASE.lower():
                root_base = LLM_API_BASE.replace("/v1", "")
                tags_resp = await client.get(f"{root_base}/api/tags")
                if tags_resp.status_code == 200:
                    models_list = tags_resp.json().get("models", [])
                    if models_list:
                        return [
                            {
                                "id": m.get("name") or m.get("model"),
                                "display_name": m.get("name") or m.get("model"),
                            }
                            for m in models_list
                            if m.get("name") or m.get("model")
                        ]
    except Exception as e:
        logger.warning(f"Could not load dynamic models list from {url}: {e}")

    # Fallback to configured model so frontend always has an active model option
    return [{"id": LLM_MODEL, "display_name": LLM_MODEL}]

