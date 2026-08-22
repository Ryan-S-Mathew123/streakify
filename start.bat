@echo off
title SongStreak - Startup

echo ============================================
echo  SongStreak - WebCMD Hackathon Project
echo ============================================
echo.

:: Start backend
echo [1/2] Starting FastAPI Backend on port 8000...
start "SongStreak Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --port 8000 --reload"

timeout /t 2 /nobreak >nul

:: Start frontend
echo [2/2] Starting Vite Frontend on port 5173...
start "SongStreak Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  SongStreak is starting up!
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Both servers are running in separate windows.
echo Close this window or press Ctrl+C to stop.
echo.
pause
