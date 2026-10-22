# 🔮 AI Jyotish Guru — Vedic Astrology Chatbot

A full-stack **Vedic Astrology (Jyotish) AI Chatbot** that computes your Kundli and provides personalized readings powered by AI.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🪷 Kundli Generation** | Full Vedic natal chart with Sidereal zodiac (Lahiri Ayanamsa) |
| **💬 AI Chat** | Conversational astrologer powered by CodeCraft API (LLM) |
| **⭐ Rashifal** | Daily/Weekly/Monthly horoscopes for all 12 Rashis |
| **❤️ Kundli Milan** | Compatibility analysis between two people |
| **🌙 Nakshatras** | All 27 Nakshatras with Padas computed |
| **🪐 9 Grahas** | Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu |

## 🚀 Deployment

### Option A: Deploy on Coolify (Oracle Cloud Server)

This repository includes a production `Dockerfile` and `docker-compose.yml` pre-configured to run seamlessly on Coolify (including Oracle Cloud ARM64 Ampere instances).

1. Open your Coolify dashboard (e.g. `http://130.210.19.223:8000`).
2. Go to **Projects** → select your project & environment.
3. Click **+ New Resource** → **Git Repository** (Public or Private).
4. Enter `https://github.com/genaidock/AI-Astrologer.git` (branch `main`).
5. Choose **Docker Compose** or **Dockerfile** build pack.
6. Under **Environment Variables**, set:
   ```env
   PORT=8000
   HOST=0.0.0.0
   LLM_API_BASE=http://host.docker.internal:11434/v1
   LLM_MODEL=qwen3.6-35b
   LLM_API_KEY=ollama
   LLM_THINK=false
   CORS_ORIGINS=*
   ```
7. Click **Deploy**. The app will be available on your assigned domain or port `8000`.

### Option B: Local Development

#### 1. Create virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

#### 2. Install dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure environment
```bash
copy .env.example .env
# Edit .env and set your Ollama or OpenAI-compatible API credentials
```

#### 4. Run the server
```bash
python main.py
```

Open **http://localhost:8000** in your browser 🎉


## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn
- **Astrology Engine**: Kerykeion (Swiss Ephemeris, Sidereal/Lahiri mode)
- **AI/LLM**: CodeCraft API (OpenAI-compatible)
- **Frontend**: Vanilla HTML/CSS/JS with cosmic glassmorphism theme

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chart` | Compute Vedic natal chart |
| POST | `/api/synastry` | Compatibility between two charts |
| GET | `/api/transits` | Current planetary positions |
| POST | `/api/chat` | Chat with AI astrologer (SSE stream) |
| POST | `/api/horoscope` | Generate horoscope for a Rashi |

## 📂 Project Structure

```
AI Astrologer/
├── main.py              # FastAPI entry point
├── config.py            # Environment configuration
├── requirements.txt     # Python dependencies
├── .env.example         # API key template
├── astro/
│   ├── engine.py        # Kerykeion Vedic chart computation
│   └── prompts.py       # LLM system prompts (Jyotish persona)
├── llm/
│   └── client.py        # CodeCraft API async HTTP client
├── models/
│   └── schemas.py       # Pydantic request/response models
├── routes/
│   ├── chart.py         # Chart & synastry endpoints
│   └── chat.py          # Chat & horoscope endpoints
└── static/
    ├── index.html        # Single-page frontend
    ├── css/style.css     # Cosmic glassmorphism theme
    └── js/app.js         # Frontend logic & streaming
```

## 🔑 Getting Your CodeCraft API Key

1. Go to [codecraftapi.com](https://codecraftapi.com)
2. Sign up / Sign in
3. Navigate to **Dashboard → API Keys**
4. Click **Create Key**
5. Paste it in your `.env` file
