import datetime
from .database import SessionLocal, engine, Base
from .models import User, Group, GroupMember, Song, DailySubmission, Reaction, StreakRescue, WebcmdLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh seed if needed
    if db.query(User).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database...")

    # 1. Create Users
    users_data = [
        {"username": "ryan", "display_name": "Ryan", "email": "ryan@songstreak.com", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan", "is_admin": True},
        {"username": "alex", "display_name": "Alex", "email": "alex@songstreak.com", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", "is_admin": False},
        {"username": "sam", "display_name": "Sam", "email": "sam@songstreak.com", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam", "is_admin": False},
        {"username": "john", "display_name": "John", "email": "john@songstreak.com", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=John", "is_admin": False},
        {"username": "josh", "display_name": "Josh", "email": "josh@songstreak.com", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh", "is_admin": False},
    ]

    users = {}
    for u in users_data:
        user = User(**u)
        db.add(user)
        db.flush()
        users[u["username"]] = user

    # 2. Create Group
    group = Group(
        name="Ryan's Music Circle",
        invite_code="SONG-8X29",
        created_by_id=users["ryan"].id
    )
    db.add(group)
    db.flush()

    # Add members
    for u in users.values():
        gm = GroupMember(group_id=group.id, user_id=u.id)
        db.add(gm)

    # 3. Create Songs
    songs_data = [
        {
            "spotify_id": "webcmd_1847992612",
            "title": "Raindance",
            "artists": "Dave & Tems",
            "album": "The Boy Who Played the Harp",
            "album_image_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/99/49/24/9949241c-e52c-3018-eae8-c686013a7474/25UM1IM68216.rgb.jpg/600x600bb.jpg",
            "spotify_url": "https://open.spotify.com/track/webcmd_1847992612",
            "duration_ms": 219744
        },
        {
            "spotify_id": "webcmd_nights_fo",
            "title": "Nights",
            "artists": "Frank Ocean",
            "album": "Blonde",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
            "spotify_url": "https://open.spotify.com/track/webcmd_nights_fo",
            "duration_ms": 307000
        },
        {
            "spotify_id": "webcmd_505_am",
            "title": "505",
            "artists": "Arctic Monkeys",
            "album": "Favourite Worst Nightmare",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/a/a7/Arcticmonkeys_favourite_worst_nightmare.jpg",
            "spotify_url": "https://open.spotify.com/track/webcmd_505_am",
            "duration_ms": 253000
        },
        {
            "spotify_id": "webcmd_afterdark_mk",
            "title": "After Dark",
            "artists": "Mr.Kitty",
            "album": "Time",
            "album_image_url": "https://m.media-amazon.com/images/I/71r-070k1EL._UF1000,1000_QL80_.jpg",
            "spotify_url": "https://open.spotify.com/track/webcmd_afterdark_mk",
            "duration_ms": 259000
        },
        {
            "spotify_id": "webcmd_letithappen_ti",
            "title": "Let It Happen",
            "artists": "Tame Impala",
            "album": "Currents",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png",
            "spotify_url": "https://open.spotify.com/track/webcmd_letithappen_ti",
            "duration_ms": 467000
        },
        {
            "spotify_id": "webcmd_blinding_tw",
            "title": "Blinding Lights",
            "artists": "The Weeknd",
            "album": "After Hours",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_Blinding_Lights.png",
            "spotify_url": "https://open.spotify.com/track/webcmd_blinding_tw",
            "duration_ms": 200000
        }
    ]

    songs = {}
    for s in songs_data:
        song = Song(**s)
        db.add(song)
        db.flush()
        songs[s["spotify_id"]] = song

    # 4. Generate Submissions for Today and Past Days
    today = datetime.date.today()
    
    # Ryan: submitted for last 14 days up to today
    for i in range(14, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        s_obj = songs["webcmd_nights_fo"] if i % 2 == 0 else songs["webcmd_1847992612"]
        sub = DailySubmission(
            user_id=users["ryan"].id,
            group_id=group.id,
            song_id=s_obj.id,
            submission_date=day_str
        )
        db.add(sub)

    # Alex: submitted for last 9 days
    for i in range(9, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["alex"].id,
            group_id=group.id,
            song_id=songs["webcmd_505_am"].id,
            submission_date=day_str
        )
        db.add(sub)

    # Sam: submitted for last 21 days
    for i in range(21, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["sam"].id,
            group_id=group.id,
            song_id=songs["webcmd_afterdark_mk"].id,
            submission_date=day_str
        )
        db.add(sub)

    # John: submitted up to yesterday
    for i in range(16, 0, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["john"].id,
            group_id=group.id,
            song_id=songs["webcmd_letithappen_ti"].id,
            submission_date=day_str
        )
        db.add(sub)

    # Josh: submitted for last 9 days
    for i in range(9, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["josh"].id,
            group_id=group.id,
            song_id=songs["webcmd_blinding_tw"].id,
            submission_date=day_str
        )
        db.add(sub)

    db.flush()

    # 5. Add Reactions for Today's Submissions
    today_subs = db.query(DailySubmission).filter(DailySubmission.submission_date == today.isoformat()).all()
    for sub in today_subs:
        if sub.user_id == users["ryan"].id:
            db.add(Reaction(submission_id=sub.id, user_id=users["alex"].id, emoji="🔥"))
            db.add(Reaction(submission_id=sub.id, user_id=users["sam"].id, emoji="❤️"))
            db.add(Reaction(submission_id=sub.id, user_id=users["john"].id, emoji="🔥"))
            db.add(Reaction(submission_id=sub.id, user_id=users["josh"].id, emoji="😭"))
        elif sub.user_id == users["alex"].id:
            db.add(Reaction(submission_id=sub.id, user_id=users["ryan"].id, emoji="❤️"))
            db.add(Reaction(submission_id=sub.id, user_id=users["sam"].id, emoji="🔥"))
        elif sub.user_id == users["sam"].id:
            db.add(Reaction(submission_id=sub.id, user_id=users["ryan"].id, emoji="🔥"))
            db.add(Reaction(submission_id=sub.id, user_id=users["alex"].id, emoji="❤️"))

    # 6. Add Pending Streak Rescue Request for John
    rescue = StreakRescue(
        user_id=users["john"].id,
        group_id=group.id,
        target_date=(today - datetime.timedelta(days=1)).isoformat(),
        reason="Flight was delayed and I had zero cellular access all night! Please rescue my 16-day streak 🙏",
        status="pending"
    )
    db.add(rescue)

    # 7. Add Initial WebcmdLog Entry
    webcmd_log = WebcmdLog(
        command='webcmd webcmd-plugin-spotify search "raindance" --limit 10 -f json',
        query="raindance",
        duration_ms=1820,
        status_code=0,
        output_preview='[{"title": "Raindance", "artists": "Dave & Tems", "album": "The Boy Who Played the Harp", "spotify_id": "webcmd_1847992612"}]'
    )
    db.add(webcmd_log)

    db.commit()
    print("Database successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_database()
