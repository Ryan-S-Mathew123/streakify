import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.middleware.sessions import SessionMiddleware

from backend.database import Base, get_db
from backend.models import DailySubmission, Group, User
from backend.routers import auth, feed, groups
from backend.routers.streaks import calculate_user_streak
from backend.itunes_service import normalize_itunes_track


def test_normalize_itunes_track_maps_catalog_payload_to_app_shape():
    payload = {
        "trackId": 123,
        "trackName": "Midnight City",
        "artistName": "M83",
        "collectionName": "Hurry Up, We're Dreaming",
        "artworkUrl100": "https://example.com/100x100bb.jpg",
        "trackViewUrl": "https://music.apple.com/us/album/midnight-city/123",
        "trackTimeMillis": 240000,
    }

    result = normalize_itunes_track(payload)

    assert result["catalog_id"] == "123"
    assert result["title"] == "Midnight City"
    assert result["artists"] == "M83"
    assert result["album"] == "Hurry Up, We're Dreaming"
    assert result["album_image_url"] == "https://example.com/600x600bb.jpg"
    assert result["catalog_url"] == "https://music.apple.com/us/album/midnight-city/123"
    assert result["duration_ms"] == 240000


def test_streak_calculation():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    user = User(username="testuser", display_name="Test User", email="test@test.com")
    group = Group(name="Test Group", invite_code="TEST-1234", created_by_id=1)
    db.add_all([user, group])
    db.commit()

    today = datetime.date.today()
    for i in range(5, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(user_id=user.id, group_id=group.id, song_id=1, submission_date=day_str)
        db.add(sub)
    db.commit()

    streak = calculate_user_streak(user.id, group.id, db)
    assert streak == 6
    db.close()


def test_registration_session_circle_and_logout():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    test_session = sessionmaker(bind=engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI()
    app.add_middleware(SessionMiddleware, secret_key="integration-test-secret")
    app.include_router(auth.router)
    app.include_router(groups.router)
    app.include_router(feed.router)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        registered = client.post("/api/auth/register", json={
            "display_name": "Test Listener",
            "email": "listener@example.com",
            "password": "a-long-test-password",
        })
        assert registered.status_code == 201
        assert "password_hash" not in registered.json()
        user_id = registered.json()["id"]

        session = client.get("/api/auth/me")
        assert session.status_code == 200
        assert session.json()["id"] == user_id

        circle = client.get("/api/groups/main")
        assert circle.status_code == 200
        assert circle.json()["name"] == "Streakify Circle"
        assert circle.json()["member_count"] == 1

        bad_login = client.post("/api/auth/login", json={
            "email": "listener@example.com",
            "password": "incorrect-password",
        })
        assert bad_login.status_code == 401

        assert client.post("/api/auth/logout").status_code == 200
        signed_out = client.get("/api/auth/me")
        assert signed_out.status_code == 200
        assert signed_out.json() is None
        assert client.get("/api/feed/1?current_user_id=1").status_code == 401

        login = client.post("/api/auth/login", json={
            "email": "listener@example.com",
            "password": "a-long-test-password",
        })
        assert login.status_code == 200
        assert client.get("/api/auth/me").status_code == 200

    engine.dispose()
