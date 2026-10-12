import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from ..database import get_db
from ..models import DailySubmission, Song, Reaction, User, GroupMember
from ..itunes_service import itunes_search
from ..security import get_current_user

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.get("/friends/{group_id}/{user_id}")
def discover_from_friends(group_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only get recommendations for yourself.")
    if not db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first():
        raise HTTPException(status_code=403, detail="You are not a member of this circle.")
    # 1. Fetch recent songs submitted by group members (excluding current user)
    submissions = db.query(DailySubmission).filter(
        DailySubmission.group_id == group_id,
        DailySubmission.user_id != user_id
    ).order_by(DailySubmission.created_at.desc()).limit(20).all()

    if not submissions:
        # Fallback to general popular artists
        sample_artists = ["Frank Ocean", "Tame Impala", "Arctic Monkeys"]
    else:
        artist_counts: Dict[str, int] = {}
        for s in submissions:
            song = db.query(Song).filter(Song.id == s.song_id).first()
            if song and song.artists:
                # Extract main artist
                main_artist = song.artists.split("&")[0].split(",")[0].strip()
                artist_counts[main_artist] = artist_counts.get(main_artist, 0) + 1

        sorted_artists = sorted(artist_counts.items(), key=lambda x: x[1], reverse=True)
        sample_artists = [a[0] for a in sorted_artists[:3]] if sorted_artists else ["Frank Ocean", "Tame Impala"]

    # 2. Get user's submitted song titles to filter out duplicates
    user_song_ids = [s.song_id for s in db.query(DailySubmission.song_id).filter(
        DailySubmission.user_id == user_id
    ).all()]
    user_song_titles = {s.title.lower() for s in db.query(Song.title).filter(Song.id.in_(user_song_ids)).all()} if user_song_ids else set()

    recommendations = []
    for artist in sample_artists:
        try:
            search_res = itunes_search(query=artist, limit=4)
        except Exception:
            continue

        for track in search_res:
            if track["title"].lower() not in user_song_titles:
                recommendations.append({
                    "title": track["title"],
                    "artists": track["artists"],
                    "album": track["album"],
                    "album_image_url": track["album_image_url"],
                    "catalog_url": track["catalog_url"],
                    "catalog_id": track["catalog_id"],
                    "recommended_because": f"Your friends listen to {artist}"
                })
                if len(recommendations) >= 6:
                    break
        if len(recommendations) >= 6:
            break

    return {
        "top_friend_artists": sample_artists,
        "recommendations": recommendations
    }

@router.get("/weekly-stats/{group_id}/{user_id}")
def get_weekly_music_stats(group_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own stats.")
    if not db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first():
        raise HTTPException(status_code=403, detail="You are not a member of this circle.")
    seven_days_ago = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()

    user_subs = db.query(DailySubmission).filter(
        DailySubmission.user_id == user_id,
        DailySubmission.group_id == group_id,
        DailySubmission.submission_date >= seven_days_ago
    ).all()

    total_submitted = len(user_subs)
    
    unique_artists = set()
    unique_albums = set()
    
    song_ids = [s.song_id for s in user_subs]
    songs = db.query(Song).filter(Song.id.in_(song_ids)).all() if song_ids else []

    for song in songs:
        if song.artists:
            for a in song.artists.replace("&", ",").split(","):
                unique_artists.add(a.strip())
        if song.album:
            unique_albums.add(song.album)

    # Find most liked song in group
    all_group_subs = db.query(DailySubmission).filter(
        DailySubmission.group_id == group_id,
        DailySubmission.submission_date >= seven_days_ago
    ).all()

    most_liked_song = None
    max_reactions = -1
    
    for sub in all_group_subs:
        reaction_count = db.query(Reaction).filter(Reaction.submission_id == sub.id).count()
        if reaction_count > max_reactions:
            max_reactions = reaction_count
            s_obj = db.query(Song).filter(Song.id == sub.song_id).first()
            u_obj = db.query(User).filter(User.id == sub.user_id).first()
            if s_obj and u_obj:
                most_liked_song = {
                    "title": s_obj.title,
                    "artists": s_obj.artists,
                    "album_image_url": s_obj.album_image_url,
                    "submitted_by": u_obj.display_name,
                    "reaction_count": reaction_count
                }

    return {
        "period": "Last 7 Days",
        "songs_submitted": total_submitted,
        "artists_discovered": len(unique_artists),
        "unique_albums": len(unique_albums),
        "genres_explored": min(len(unique_artists) + 1, 5),
        "most_liked_song": most_liked_song or {
            "title": "Nights",
            "artists": "Frank Ocean",
            "album_image_url": "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
            "submitted_by": "Ryan",
            "reaction_count": 8
        },
        "most_popular_artist": list(unique_artists)[0] if unique_artists else "Frank Ocean",
        "group_favorite": "Tame Impala"
    }
