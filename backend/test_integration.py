import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import Base
from .models import User, Group, GroupMember, Song, DailySubmission, Reaction, StreakRescue
from .webcmd_service import run_webcmd_spotify_search
from .routers.streaks import calculate_user_streak, calculate_group_streak
import datetime

def test_webcmd_spotify_search():
    # Test real WebCMD CLI integration
    res = run_webcmd_spotify_search("raindance", limit=5)
    assert res["status_code"] == 0
    assert res["results_count"] > 0
    first_track = res["results"][0]
    assert "Raindance" in first_track["title"]
    assert "Dave" in first_track["artists"] or "Tems" in first_track["artists"]
    assert "album_image_url" in first_track
    assert "spotify_url" in first_track

def test_streak_calculation():
    # In-memory SQLite DB for testing logic
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    u1 = User(username="testuser", display_name="Test User", email="test@test.com")
    g1 = Group(name="Test Group", invite_code="TEST-1234", created_by_id=1)
    db.add(u1)
    db.add(g1)
    db.commit()

    today = datetime.date.today()
    # Add 5 consecutive days of submissions
    for i in range(5, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(user_id=u1.id, group_id=g1.id, song_id=1, submission_date=day_str)
        db.add(sub)
    db.commit()

    streak = calculate_user_streak(u1.id, g1.id, db)
    assert streak == 6
    db.close()

if __name__ == "__main__":
    print("Running integration tests...")
    test_webcmd_spotify_search()
    test_streak_calculation()
    print("ALL INTEGRATION TESTS PASSED CLEANLY! [OK]")
