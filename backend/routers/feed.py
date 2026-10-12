import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from ..database import get_db
from ..models import DailySubmission, Song, User, Reaction, GroupMember
from ..security import get_current_user
from .streaks import calculate_user_streak

router = APIRouter(prefix="/api/feed", tags=["feed"])

class ToggleReactionRequest(BaseModel):
    submission_id: int
    user_id: int
    emoji: str

@router.get("/{group_id}")
def get_daily_feed(group_id: int, current_user_id: int, date: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own feed state.")
    membership = db.query(GroupMember).filter(GroupMember.user_id == current_user.id, GroupMember.group_id == group_id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this circle.")
    target_date = date or datetime.date.today().isoformat()

    # Check if current user has submitted today for this group
    user_sub = db.query(DailySubmission).filter(
        DailySubmission.user_id == current_user_id,
        DailySubmission.group_id == group_id,
        DailySubmission.submission_date == target_date
    ).first()

    has_submitted_today = (user_sub is not None)

    submissions = db.query(DailySubmission).filter(
        DailySubmission.group_id == group_id,
        DailySubmission.submission_date == target_date
    ).order_by(DailySubmission.created_at.desc()).all()

    feed_items = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        song = db.query(Song).filter(Song.id == sub.song_id).first()
        reactions = db.query(Reaction).filter(Reaction.submission_id == sub.id).all()

        # Group reactions by emoji
        emoji_counts: Dict[str, int] = {}
        user_reacted_emojis = []
        for r in reactions:
            emoji_counts[r.emoji] = emoji_counts.get(r.emoji, 0) + 1
            if r.user_id == current_user_id:
                user_reacted_emojis.append(r.emoji)

        streak_days = calculate_user_streak(sub.user_id, group_id, db)

        feed_items.append({
            "id": sub.id,
            "submission_date": sub.submission_date,
            "created_at": sub.created_at.isoformat(),
            "user": {
                "id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "streak": streak_days
            },
            "song": {
                "id": song.id,
                "catalog_id": song.catalog_id,
                "title": song.title,
                "artists": song.artists,
                "album": song.album,
                "album_image_url": song.album_image_url,
                "catalog_url": song.catalog_url,
                "duration_ms": song.duration_ms
            },
            "reactions": emoji_counts,
            "user_reacted_emojis": user_reacted_emojis
        })

    return {
        "date": target_date,
        "has_submitted_today": has_submitted_today,
        "feed": feed_items
    }

@router.post("/reaction")
def toggle_reaction(data: ToggleReactionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only react as yourself.")
    sub = db.query(DailySubmission).filter(DailySubmission.id == data.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    existing = db.query(Reaction).filter(
        Reaction.submission_id == data.submission_id,
        Reaction.user_id == data.user_id,
        Reaction.emoji == data.emoji
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "emoji": data.emoji}
    else:
        new_reaction = Reaction(
            submission_id=data.submission_id,
            user_id=data.user_id,
            emoji=data.emoji
        )
        db.add(new_reaction)
        db.commit()
        return {"action": "added", "emoji": data.emoji}
