"""
Async client for LLM APIs (Ollama, CodeCraft, OpenAI-compatible).

Supports both streaming (SSE) and non-streaming modes with automatic
fallback across Docker bridge gateway, host.docker.internal, and service discovery.
"""

import json
import logging
import socket
import struct
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


def get_docker_gateway() -> str | None:
    """Auto-detect the container's default gateway IP from /proc/net/route on Linux."""
    try:
        with open("/proc/net/route") as f:
            for line in f:
                fields = line.strip().split()
                if len(fields) >= 3 and fields[1] == "00000000":
                    return socket.inet_ntoa(struct.pack("<L", int(fields[2], 16)))
    except Exception:
        pass
    return None


def _get_candidate_urls(url: str) -> list[str]:
    """
    Return candidate URLs to attempt.
    Supports host.docker.internal, auto-detected Docker gateway,
    common bridge IPs (172.17.0.1, 172.18.0.1), and Coolify internal service 'ollama'.
    """
    candidates = [url]
    if "11434" in url or "ollama" in url.lower():
        current_host = url.split("://")[1].split(":")[0] if "://" in url else ""
        alt_hosts = []

        # 1. Detected Linux Docker network gateway (points back to the host machine)
        gw = get_docker_gateway()
        if gw and gw not in alt_hosts:
            alt_hosts.append(gw)

        # 2. Standard alternatives for reaching Ollama inside Docker
        for h in ["host.docker.internal", "172.17.0.1", "172.18.0.1", "ollama", "localhost"]:
            if h not in alt_hosts:
                alt_hosts.append(h)

        for h in alt_hosts:
            if h != current_host:
                alt_url = url.replace(f"://{current_host}:", f"://{h}:")
                if alt_url not in candidates:
                    candidates.append(alt_url)
    return candidates


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

    # Standard OpenAI payload — DO NOT inject unsupported top-level fields
    # like 'options' or 'think' which cause Ollama /v1/chat/completions to return 400
    payload = {
        "model": target_model,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    # If thinking is disabled for reasoning models (Qwen, DeepSeek), pass standard reasoning_effort
    if not LLM_THINK:
        payload["reasoning_effort"] = "none"

    logger.debug(f"Calling LLM: model={target_model}, url={url}, stream={stream}")

    if stream:
        return _stream_response(url, headers, payload)
    else:
        return await _full_response(url, headers, payload)


async def _stream_response(
    url: str, headers: dict, payload: dict
) -> AsyncGenerator[str, None]:
    """Stream SSE chunks from the API with automatic gateway fallback."""
    candidate_urls = _get_candidate_urls(url)
    last_error = None

    for attempt_idx, candidate_url in enumerate(candidate_urls):
        conn_timeout = httpx.Timeout(LLM_TIMEOUT, connect=4.0)
        async with httpx.AsyncClient(timeout=conn_timeout) as client:
            try:
                async with client.stream("POST", candidate_url, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        err_msg = body.decode(errors="replace")
                        logger.error(f"LLM API error {resp.status_code} at {candidate_url}: {err_msg}")
                        yield f"Error: LLM API returned status {resp.status_code}: {err_msg}"
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
            except (httpx.ConnectError, httpx.ConnectTimeout, httpx.NetworkError, httpx.RequestError) as e:
                last_error = e
                logger.warning(
                    f"Connection to {candidate_url} failed ({type(e).__name__}: {e}); trying next candidate..."
                )
                continue
            except httpx.ReadTimeout as e:
                logger.error(f"LLM request timed out after {LLM_TIMEOUT}s at {candidate_url}")
                yield f"Error: The AI model took too long to respond ({LLM_TIMEOUT}s timeout). Please try again."
                return
            except Exception as e:
                logger.exception(f"Unexpected streaming error at {candidate_url}")
                yield f"Error: {type(e).__name__}: {str(e)}"
                return

    # If all candidates failed to connect:
    logger.error(f"All candidate endpoints failed: {candidate_urls}. Last error: {last_error}")
    yield (
        f"Error: Could not connect to AI model server. "
        f"Attempted: {', '.join(candidate_urls)}. "
        f"Detail: {type(last_error).__name__ if last_error else 'Unknown'}: {str(last_error)}"
    )


async def _full_response(url: str, headers: dict, payload: dict) -> str:
    """Get full (non-streaming) response from the API with automatic gateway fallback."""
    candidate_urls = _get_candidate_urls(url)
    last_error = None

    for attempt_idx, candidate_url in enumerate(candidate_urls):
        conn_timeout = httpx.Timeout(LLM_TIMEOUT, connect=4.0)
        async with httpx.AsyncClient(timeout=conn_timeout) as client:
            try:
                resp = await client.post(candidate_url, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"LLM API error {resp.status_code} at {candidate_url}: {resp.text}")
                    return f"Error: LLM API returned status {resp.status_code}: {resp.text}"

                data = resp.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "")
            except (httpx.ConnectError, httpx.ConnectTimeout, httpx.NetworkError, httpx.RequestError) as e:
                last_error = e
                logger.warning(
                    f"Connection to {candidate_url} failed ({type(e).__name__}: {e}); trying next candidate..."
                )
                continue
            except httpx.ReadTimeout:
                return f"Error: Request to AI model timed out after {LLM_TIMEOUT}s."
            except Exception as e:
                return f"Error: {type(e).__name__}: {str(e)}"

    return f"Error: Could not connect to AI model. Attempted: {', '.join(candidate_urls)}. ({last_error})"


async def get_models() -> list[dict]:
    """
    Fetch available models from Ollama / OpenAI-compatible / CodeCraft API catalog.
    Falls back gracefully to the configured default model if endpoint is unavailable.
    """
    candidate_bases = _get_candidate_urls(LLM_API_BASE)
    headers = {}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    for base in candidate_bases:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0)) as client:
                # Try standard /models
                resp = await client.get(f"{base}/models", headers=headers)
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
                root_base = base.replace("/v1", "")
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
        except Exception:
            continue

    # Fallback to configured model so frontend always has an active model option
    return [{"id": LLM_MODEL, "display_name": LLM_MODEL}]
