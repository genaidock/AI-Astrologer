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

