@echo off
title 🔮 AI Jyotish Guru — Vedic Astrologer
color 0A
cls

echo.
echo  ============================================
echo   🔮  AI Jyotish Guru — Vedic Astrologer
echo  ============================================
echo.

:: Navigate to the script's directory
cd /d "%~dp0"

:: Check virtual environment
if not exist "venv\Scripts\python.exe" (
    echo  [ERROR] Virtual environment not found.
    echo  Please run:  python -m venv venv  ^&^&  venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

:: Check .env file
if not exist ".env" (
    echo  [WARN] .env file not found. Copying from .env.example ...
    copy ".env.example" ".env" >nul 2>&1
    echo  Please edit .env and add your CODECRAFT_API_KEY, then re-run this file.
    pause
    exit /b 1
)

echo  [1/3] Starting server...
start "" /B venv\Scripts\python.exe main.py

:: Wait until server is ready (poll port 8000 up to 15 seconds)
set /a tries=0
:WAIT_LOOP
set /a tries+=1
if %tries% gtr 15 (
    echo  [ERROR] Server did not start within 15 seconds. Check for errors above.
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
powershell -nologo -noprofile -command "try { (New-Object Net.Sockets.TcpClient).Connect('127.0.0.1',8000); exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 goto WAIT_LOOP

echo  [2/3] Server is ready!
echo  [3/3] Opening http://localhost:8000 ...
start http://localhost:8000

echo.
echo  ============================================
echo   Server running at http://localhost:8000
echo   Press Ctrl+C to stop.
echo  ============================================
echo.

:: Keep window open so server stays alive
venv\Scripts\python.exe -c "import time; print('  Server running. Close this window to stop.\n'); [time.sleep(1) for _ in iter(int, 1)]"
