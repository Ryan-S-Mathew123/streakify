import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import Song, DailySubmission, GroupMember, User
from ..itunes_service import itunes_search
from ..security import get_current_user

router = APIRouter(prefix="/api/songs", tags=["songs"])

class SubmitSongRequest(BaseModel):
    user_id: int
    group_id: int
    catalog_id: str
    title: str
    artists: str
    album: str
    album_image_url: Optional[str] = None
    catalog_url: Optional[str] = None
    duration_ms: Optional[int] = 0

@router.get("/search")
def search_songs(query: str, limit: int = 10, db: Session = Depends(get_db)):
    if not query or not query.strip():
        return {"results_count": 0, "results": []}

    try:
        results = itunes_search(query=query.strip(), limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Song catalog search is temporarily unavailable.") from exc

    return {"results_count": len(results), "results": results}

@router.post("/submit")
def submit_song(data: SubmitSongRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only submit a song for yourself.")
    membership = db.query(GroupMember).filter(GroupMember.user_id == current_user.id, GroupMember.group_id == data.group_id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this circle.")
    today_str = datetime.date.today().isoformat()

    # Check if user already submitted for this group today
    existing_sub = db.query(DailySubmission).filter(
        DailySubmission.user_id == data.user_id,
        DailySubmission.group_id == data.group_id,
        DailySubmission.submission_date == today_str
    ).first()

    if existing_sub:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted your Song of the Day for this group today! Come back tomorrow."
        )

    # Get or create Song record
    song = db.query(Song).filter(Song.catalog_id == data.catalog_id).first()
    if not song:
        song = Song(
            catalog_id=data.catalog_id,
            title=data.title,
            artists=data.artists,
            album=data.album,
            album_image_url=data.album_image_url,
            catalog_url=data.catalog_url,
            duration_ms=data.duration_ms or 0
        )
        db.add(song)
        db.flush()

    # Create DailySubmission
    submission = DailySubmission(
        user_id=data.user_id,
        group_id=data.group_id,
        song_id=song.id,
        submission_date=today_str
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Song of the Day submitted successfully!",
        "submission_id": submission.id,
        "submission_date": today_str,
        "song": {
            "title": song.title,
            "artists": song.artists,
            "album": song.album,
            "album_image_url": song.album_image_url
        }
    }

@router.get("/user-submission/{group_id}/{user_id}")
def check_user_today_submission(group_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own submissions.")
    today_str = datetime.date.today().isoformat()
    sub = db.query(DailySubmission).filter(
        DailySubmission.user_id == user_id,
        DailySubmission.group_id == group_id,
        DailySubmission.submission_date == today_str
    ).first()

    if not sub:
        return {"submitted": False, "submission": None}

    song = db.query(Song).filter(Song.id == sub.song_id).first()
    return {
        "submitted": True,
        "submission": {
            "id": sub.id,
            "submission_date": sub.submission_date,
            "song": {
                "title": song.title,
                "artists": song.artists,
                "album": song.album,
                "album_image_url": song.album_image_url,
                "catalog_url": song.catalog_url
            }
        }
    }
