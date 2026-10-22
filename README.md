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

## 🚀 Quick Start

### 1. Create virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API key
```bash
copy .env.example .env
# Edit .env and add your CodeCraft API key
```

### 4. Run the server
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
