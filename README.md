# Streakify

Streakify is a daily song-picking ritual for friends. Create an account, choose one song each day, and build a shared circle streak.

## Features

- Email/password accounts with signed, HTTP-only sessions
- One shared circle; new members join automatically
- iTunes Search API catalog lookup without API credentials
- One song submission per member per day
- Personal and circle streaks, leaderboard, and weekly stats
- Friend-based song discovery and compact reactions
- Persistent light and dark themes
- No audio playback; Streakify is about the daily ritual

## Stack

- FastAPI, SQLAlchemy, SQLite
- React, TypeScript, Vite, Tailwind CSS
- Docker single-service deployment

## Run Locally

From the project root, install the backend dependencies and start the API:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and create an account. The first account starts the shared circle; subsequent registrations join it automatically. The API docs are available locally at http://localhost:8000/docs.

On Windows, `start.bat` starts both development servers after the dependencies are installed.

## Deploy

The repository includes a Render Blueprint. In Render, create a new Blueprint from this repository. It builds the frontend and serves it with FastAPI on one origin, generates `SESSION_SECRET`, and mounts SQLite on a persistent disk. Keep the service to one instance while using SQLite.

For another Docker host, provide:

- `APP_ENV=production`
- A strong `SESSION_SECRET`
- `DATABASE_URL`, pointing to a persistent SQLite file
- A persistent volume mounted at `/var/data`

The server reads the platform-provided `PORT`. Demo seeding is off by default; do not enable `SEED_DEMO_DATA` in production.

## Project Layout

```text
.
├── backend/
│   ├── circle.py
│   ├── database.py
│   ├── itunes_service.py
│   ├── main.py
│   ├── models.py
│   ├── security.py
│   └── routers/
├── frontend/
│   └── src/
├── Dockerfile
├── render.yaml
└── start.bat
```

## License

MIT