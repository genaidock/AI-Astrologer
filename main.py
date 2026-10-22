"""
AI Astrologer — FastAPI Application Entry Point

A Vedic Astrology (Jyotish) chatbot powered by Kerykeion + LLM (Ollama / CodeCraft / OpenAI).
"""

import logging
import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import HOST, PORT, LLM_API_BASE, LLM_MODEL, CORS_ORIGINS
from limiter import limiter
from routes.chart import router as chart_router
from routes.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("ai_astrologer")

# Create FastAPI app
app = FastAPI(
    title="🔮 AI Astrologer — Jyotish Guru",
    description="A Vedic Astrology chatbot powered by AI. Get your Kundli, daily Rashifal, and personalized readings.",
    version="1.0.0",
)

# Rate limiter — shared instance from limiter.py, mounted on app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
parsed_origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
if "*" in parsed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=parsed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Health check endpoint for Coolify / Docker monitoring
@app.get("/api/health", tags=["system"])
async def health_check():
    """Health check endpoint used by Docker healthchecks and reverse proxies."""
    return {
        "status": "ok",
        "service": "AI Astrologer",
        "llm_base": LLM_API_BASE,
        "model": LLM_MODEL,
    }

# Diagnostic endpoint to verify LLM network connectivity from inside Docker
@app.get("/api/debug-llm", tags=["system"])
async def debug_llm():
    """Probe Ollama and candidate URLs to identify network reachability."""
    import httpx
    from llm.client import get_docker_gateway, _get_candidate_urls

    gw = get_docker_gateway()
    candidates = _get_candidate_urls(LLM_API_BASE)

    probes = {}
    for c in candidates:
        root = c.replace("/v1", "").replace("/chat/completions", "").rstrip("/")
        tags_url = f"{root}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=2.0)) as client:
                res = await client.get(tags_url)
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    probes[tags_url] = {"status": 200, "models": models}
                else:
                    probes[tags_url] = {"status": res.status_code, "body": res.text[:200]}
        except Exception as e:
            probes[tags_url] = f"{type(e).__name__}: {str(e)}"

    return {
        "status": "diagnostic",
        "container_gateway": gw,
        "configured_llm_base": LLM_API_BASE,
        "configured_model": LLM_MODEL,
        "candidates_evaluated": candidates,
        "probes": probes,
    }


# Register API routes
app.include_router(chart_router)
app.include_router(chat_router)

# Serve static files (frontend)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    logger.info(f"Starting AI Astrologer on {HOST}:{PORT}")
    logger.info(f"Connected to LLM: {LLM_MODEL} at {LLM_API_BASE}")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info",
    )

