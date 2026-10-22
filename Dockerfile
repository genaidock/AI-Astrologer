FROM python:3.11-slim

WORKDIR /app

# Install build dependencies required by pyswisseph (Swiss Ephemeris C extensions)
# on ARM64 (Oracle Cloud Ampere A1) and amd64, plus curl for container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Ensure cache directory exists for Swiss Ephemeris / Geonames database cache
RUN mkdir -p cache

# Runtime environment settings
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

EXPOSE 8000 3000

# Container healthcheck: dynamically checks configured PORT, with fallbacks to 8000 and 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD sh -c "curl -f http://localhost:\${PORT:-8000}/api/health || curl -f http://localhost:8000/api/health || curl -f http://localhost:3000/api/health || exit 1"

# Start FastAPI application
CMD ["python", "main.py"]

