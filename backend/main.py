import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

from .database import engine, Base, migrate_database
from .seed import seed_database
from .routers import auth, groups, songs, feed, streaks, discovery

# Create tables
Base.metadata.create_all(bind=engine)
migrate_database()

if os.getenv("SEED_DEMO_DATA", "false").lower() == "true":
    seed_database()

is_production = os.getenv("APP_ENV", "development").lower() == "production"
session_secret = os.getenv("SESSION_SECRET")
if is_production and not session_secret:
    raise RuntimeError("SESSION_SECRET must be set in production.")

app = FastAPI(
    title="Streakify API",
    description="A shared daily song circle for friends.",
    version="1.0.0",
    openapi_url=None if is_production else "/openapi.json",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret or "local-development-session-secret",
    same_site="lax",
    https_only=is_production,
    max_age=60 * 60 * 24 * 14,
)

# Register routers
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(songs.router)
app.include_router(feed.router)
app.include_router(streaks.router)
app.include_router(discovery.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Streakify Backend",
        "song_catalog": "iTunes Search API",
        "database": "SQLite",
    }

FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_frontend_root():
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{path:path}", include_in_schema=False)
    def serve_frontend(path: str):
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found.")
        requested = (FRONTEND_DIST / path).resolve()
        if path and requested.is_file() and FRONTEND_DIST.resolve() in requested.parents:
            return FileResponse(requested)
        raise HTTPException(status_code=404, detail="Not found.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=not is_production)
