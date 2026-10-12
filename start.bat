@echo off
setlocal
set "ROOT=%~dp0"

title Streakify - Daily Song Streak App

echo ============================================
echo  Streakify - Daily Song Streak App
echo ============================================
echo.

:: Ensure frontend deps are installed
if not exist "%ROOT%frontend\node_modules" (
  echo [0/2] Installing frontend dependencies...
  cd /d "%ROOT%frontend" && npm install
)

:: Start backend
echo [1/2] Starting FastAPI backend on port 8000...
start "Streakify Backend" cmd /k "cd /d ""%ROOT%"" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

:: Start frontend
echo [2/2] Starting Vite frontend on port 5173...
start "Streakify Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo  Streakify is starting up!
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
endlocal
