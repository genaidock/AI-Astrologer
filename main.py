"""
AI Astrologer — FastAPI Application Entry Point

A Vedic Astrology (Jyotish) chatbot powered by Kerykeion + CodeCraft API.
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

from config import HOST, PORT
from limiter import limiter
from routes.chart import router as chart_router
from routes.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

# Create FastAPI app
app = FastAPI(
    title="🔮 AI Astrologer — Jyotish Guru",
    description="A Vedic Astrology chatbot powered by AI. Get your Kundli, daily Rashifal, and personalized readings.",
    version="1.0.0",
)

# Rate limiter — shared instance from limiter.py, mounted on app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — credentials require an explicit origin list (wildcard + credentials is rejected by browsers)
# In production, replace with your actual frontend origin(s).
import os as _os
_cors_origins = [o.strip() for o in _os.getenv("CORS_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(chart_router)
app.include_router(chat_router)

# Serve static files (frontend)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info",
    )
