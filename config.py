"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM API Settings (Compatible with Ollama, CodeCraft, OpenAI, etc.) ──
# Accepts both LLM_* and common typo LLN_* from Coolify environment variables
raw_base = (
    os.getenv("LLM_API_BASE")
    or os.getenv("LLN_API_BASE")
    or os.getenv("OLLAMA_BASE_URL")
    or os.getenv("CODECRAFT_API_BASE")
    or "http://host.docker.internal:11434/v1"
).rstrip("/")

# If user provided Ollama URL without /v1 (e.g. http://localhost:11434), append /v1
if not raw_base.endswith("/v1") and "/api" not in raw_base:
    raw_base = f"{raw_base}/v1"

LLM_API_BASE: str = raw_base

LLM_API_KEY: str = (
    os.getenv("LLM_API_KEY")
    or os.getenv("LLN_API_KEY")
    or os.getenv("CODECRAFT_API_KEY")
    or "ollama"  # Ollama accepts any dummy string for Bearer token
)

LLM_MODEL: str = (
    os.getenv("LLM_MODEL")
    or os.getenv("LLN_MODEL")
    or os.getenv("OLLAMA_MODEL")
    or os.getenv("CODECRAFT_MODEL")
    or "qwen3.6-35b"
)

# Inference controls
# Reasoning mode for models that support it (e.g. Qwen 2.5/3.x, DeepSeek R1).
# Defaults to False for rapid 5-15s horoscope/tarot responses on CPU/ARM.
LLM_THINK: bool = (
    os.getenv("LLM_THINK")
    or os.getenv("LLN_THINK")
    or "false"
).lower() in ("true", "1", "yes")

# Request timeout in seconds (ARM CPU generation and cold model swaps can take longer)
LLM_TIMEOUT: float = float(
    os.getenv("LLM_TIMEOUT")
    or os.getenv("LLN_TIMEOUT")
    or "600.0"
)

# Backward compatibility aliases
CODECRAFT_API_KEY: str = LLM_API_KEY
CODECRAFT_API_BASE: str = LLM_API_BASE
CODECRAFT_MODEL: str = LLM_MODEL

# ── Server settings ─────────────────────────────────────────────────────
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")


