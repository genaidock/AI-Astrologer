"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

# CodeCraft API LLM settings
CODECRAFT_API_KEY: str = os.getenv("CODECRAFT_API_KEY", "")
CODECRAFT_API_BASE: str = os.getenv("CODECRAFT_API_BASE", "https://codecraftapi.com/v1")
CODECRAFT_MODEL: str = os.getenv("CODECRAFT_MODEL", "deepseek-v4-pro-max")

# Server settings
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
