from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import auth, groups, songs, feed, streaks, discovery, webcmd_logs

# Create tables
Base.metadata.create_all(bind=engine)

# Auto seed on startup if database empty
seed_database()

app = FastAPI(
    title="SongStreak API",
    description="Social Daily Song & Streak Platform powered by WebCMD",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(songs.router)
app.include_router(feed.router)
app.include_router(streaks.router)
app.include_router(discovery.router)
app.include_router(webcmd_logs.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SongStreak Backend",
        "webcmd_integration": "active",
        "database": "SQLite (songstreak.db)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
