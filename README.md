# ?? SongStreak — Social Daily Song & Streak Platform

> **One song every day. One streak together.**

SongStreak is a social music platform where friends share exactly **one Song of the Day** and build streaks together. Built for the **WebCMD Hackathon**, it showcases WebCMD as a core architectural component for music discovery.

---

## ?? Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- WebCMD installed globally (`npm install -g webcmd`)
- `webcmd-plugin-spotify` plugin (included in this repo)

### 1. Install the WebCMD plugin

```
cd webcmd-plugin-spotify
npm install
cd ..
webcmd install webcmd-plugin-spotify
```

Verify:
```
webcmd webcmd-plugin-spotify search "Taylor Swift" --limit 4 -f json
```

### 2. Start the Backend

```
cd backend
pip install -r requirements.txt
python seed.py
python -m uvicorn main:app --port 8000 --reload
```

Backend: http://localhost:8000 | Docs: http://localhost:8000/docs

### 3. Start the Frontend

```
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### 4. Log in as `ryan` (admin user with pre-seeded data)

---

## ?? WebCMD Integration — The Core

**WebCMD is not a peripheral feature — it IS the song discovery engine.**

Every song search flows through the WebCMD CLI:

```
User query ? POST /api/spotify/search
           ? webcmd_service.py
           ? webcmd webcmd-plugin-spotify search "<query>" --limit 4 -f json
           ? iTunes Search API ? Spotify-schema JSON
           ? Results displayed + logged to webcmd_logs table
```

### Custom Plugin: `webcmd-plugin-spotify`

- Located in `webcmd-plugin-spotify/`
- Queries iTunes Search API (public, no auth)
- Returns Spotify-compatible JSON (title, artists, album, album_image_url, duration_ms)
- Supports: `--limit`, `-f json`

### WebCMD Observability

Every CLI call is logged with: command string, query, duration_ms, status_code, output preview, timestamp. Visible in the **WebCMD** tab.

---

## ? Features

- Auth: Login/register (demo users pre-seeded)
- Groups: Create/join via invite code
- Song of the Day: One submission per day per group
- WebCMD Search: Real-time music search via CLI
- Streaks: Individual and group streak tracking
- Leaderboard: Ranked by streak, submissions, reactions
- Reactions: Emoji reactions on friends' songs
- Streak Rescue: Admin-approved emergency rescue
- Discovery: Browse friends' recent submissions
- Weekly Stats: Top artists, tracks, heatmap
- Observability: Live WebCMD CLI log panel

---

## ?? Demo Users (seeded)

| Username | Role   | Streak |
|----------|--------|--------|
| ryan     | Admin  | 15 days |
| sam      | Member | 22 days ?? |
| john     | Member | 16 days |
| alex     | Member | 10 days |
| josh     | Member | 10 days |

All in group **Ryan's Music Circle** (invite code shown in app).

---

## ??? Architecture

```
WEBCMD hackathon/
+-- backend/
¦   +-- main.py               # FastAPI entrypoint
¦   +-- webcmd_service.py     # ? WebCMD CLI wrapper
¦   +-- models.py             # SQLAlchemy ORM
¦   +-- seed.py               # Demo data
¦   +-- routers/              # auth, groups, songs, streaks, discovery
+-- frontend/
¦   +-- src/components/       # Feed, SongSearchSubmit, Leaderboard,
¦                             #   Discovery, WeeklyStats, AdminRescue,
¦                             #   WebcmdObservability
+-- webcmd-plugin-spotify/    # ? Custom WebCMD plugin
    +-- index.js
    +-- search.js             # iTunes ? Spotify-schema mapper
```

---

## ?? Hackathon: WebCMD Compliance

1. ? **Architecturally core** — search fails without WebCMD
2. ? **Custom plugin** — written for this project
3. ? **Live invocation** — CLI called per search, never faked
4. ? **Structured output** — JSON consumed by backend
5. ? **Observability** — every call logged and surfaced in UI
6. ? **Real data** — iTunes Search API, not hardcoded

---

MIT — WebCMD Hackathon 2026
