import datetime
from .database import SessionLocal, engine, Base
from .models import User, Group, GroupMember, Song, DailySubmission, Reaction

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
        {"username": "ryan", "display_name": "Ryan", "email": "ryan@streakify.app", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan", "is_admin": True},
        {"username": "alex", "display_name": "Alex", "email": "alex@streakify.app", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", "is_admin": False},
        {"username": "sam", "display_name": "Sam", "email": "sam@streakify.app", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam", "is_admin": False},
        {"username": "john", "display_name": "John", "email": "john@streakify.app", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=John", "is_admin": False},
        {"username": "josh", "display_name": "Josh", "email": "josh@streakify.app", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh", "is_admin": False},
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
            "catalog_id": "seed_raindance_dave_tems",
            "title": "Raindance",
            "artists": "Dave & Tems",
            "album": "The Boy Who Played the Harp",
            "album_image_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/99/49/24/9949241c-e52c-3018-eae8-c686013a7474/25UM1IM68216.rgb.jpg/600x600bb.jpg",
            "catalog_url": "",
            "duration_ms": 219744
        },
        {
            "catalog_id": "seed_nights_frank_ocean",
            "title": "Nights",
            "artists": "Frank Ocean",
            "album": "Blonde",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
            "catalog_url": "",
            "duration_ms": 307000
        },
        {
            "catalog_id": "seed_505_arctic_monkeys",
            "title": "505",
            "artists": "Arctic Monkeys",
            "album": "Favourite Worst Nightmare",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/a/a7/Arcticmonkeys_favourite_worst_nightmare.jpg",
            "catalog_url": "",
            "duration_ms": 253000
        },
        {
            "catalog_id": "seed_after_dark_mr_kitty",
            "title": "After Dark",
            "artists": "Mr.Kitty",
            "album": "Time",
            "album_image_url": "https://m.media-amazon.com/images/I/71r-070k1EL._UF1000,1000_QL80_.jpg",
            "catalog_url": "",
            "duration_ms": 259000
        },
        {
            "catalog_id": "seed_let_it_happen_tame_impala",
            "title": "Let It Happen",
            "artists": "Tame Impala",
            "album": "Currents",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png",
            "catalog_url": "",
            "duration_ms": 467000
        },
        {
            "catalog_id": "seed_blinding_lights_weeknd",
            "title": "Blinding Lights",
            "artists": "The Weeknd",
            "album": "After Hours",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_Blinding_Lights.png",
            "catalog_url": "",
            "duration_ms": 200000
        }
    ]

    songs = {}
    for s in songs_data:
        song = Song(**s)
        db.add(song)
        db.flush()
        songs[s["catalog_id"]] = song

    # 4. Generate Submissions for Today and Past Days
    today = datetime.date.today()
    
    # Ryan: submitted for last 14 days up to today
    for i in range(14, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        s_obj = songs["seed_nights_frank_ocean"] if i % 2 == 0 else songs["seed_raindance_dave_tems"]
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
            song_id=songs["seed_505_arctic_monkeys"].id,
            submission_date=day_str
        )
        db.add(sub)

    # Sam: submitted for last 21 days
    for i in range(21, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["sam"].id,
            group_id=group.id,
            song_id=songs["seed_after_dark_mr_kitty"].id,
            submission_date=day_str
        )
        db.add(sub)

    # John: submitted up to yesterday
    for i in range(16, 0, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["john"].id,
            group_id=group.id,
            song_id=songs["seed_let_it_happen_tame_impala"].id,
            submission_date=day_str
        )
        db.add(sub)

    # Josh: submitted for last 9 days
    for i in range(9, -1, -1):
        day_str = (today - datetime.timedelta(days=i)).isoformat()
        sub = DailySubmission(
            user_id=users["josh"].id,
            group_id=group.id,
            song_id=songs["seed_blinding_lights_weeknd"].id,
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

    db.commit()
    print("Database successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_database()
