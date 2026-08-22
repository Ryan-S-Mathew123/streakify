import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..models import DailySubmission, GroupMember, User, Reaction, StreakRescue, Group

router = APIRouter(prefix="/api/streaks", tags=["streaks"])

def calculate_user_streak(user_id: int, group_id: int, db: Session) -> int:
    today = datetime.date.today()
    submissions = db.query(DailySubmission.submission_date).filter(
        DailySubmission.user_id == user_id,
        DailySubmission.group_id == group_id
    ).order_by(DailySubmission.submission_date.desc()).all()

    dates_set = {s.submission_date for s in submissions}
    if not dates_set:
        return 0

    streak = 0
    curr_date = today

    # If submitted today, start counting backwards from today
    # If not submitted today yet, check if submitted yesterday to keep streak active
    if curr_date.isoformat() not in dates_set:
        curr_date = today - datetime.timedelta(days=1)
        if curr_date.isoformat() not in dates_set:
            return 0

    while curr_date.isoformat() in dates_set:
        streak += 1
        curr_date = curr_date - datetime.timedelta(days=1)

    return streak

def calculate_group_streak(group_id: int, db: Session) -> int:
    memberships = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    if not memberships:
        return 0

    user_ids = [m.user_id for m in memberships]

    today = datetime.date.today()
    streak = 0
    curr_date = today

    def all_members_submitted(d: datetime.date) -> bool:
        d_str = d.isoformat()
        submitted_users = db.query(DailySubmission.user_id).filter(
            DailySubmission.group_id == group_id,
            DailySubmission.submission_date == d_str,
            DailySubmission.user_id.in_(user_ids)
        ).distinct().all()
        return len(submitted_users) == len(user_ids)

    if not all_members_submitted(curr_date):
        curr_date = today - datetime.timedelta(days=1)
        if not all_members_submitted(curr_date):
            return 0

    while all_members_submitted(curr_date):
        streak += 1
        curr_date = curr_date - datetime.timedelta(days=1)

    return streak

@router.get("/group/{group_id}")
def get_group_streaks_overview(group_id: int, db: Session = Depends(get_db)):
    memberships = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    leaderboard = []

    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        if not user:
            continue

        streak = calculate_user_streak(user.id, group_id, db)
        total_subs = db.query(DailySubmission).filter(
            DailySubmission.user_id == user.id,
            DailySubmission.group_id == group_id
        ).count()

        # Count total reactions received on user's submissions
        sub_ids = [s.id for s in db.query(DailySubmission.id).filter(
            DailySubmission.user_id == user.id,
            DailySubmission.group_id == group_id
        ).all()]
        reactions_received = db.query(Reaction).filter(Reaction.submission_id.in_(sub_ids)).count() if sub_ids else 0

        leaderboard.append({
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "streak": streak,
            "total_submissions": total_subs,
            "reactions_received": reactions_received
        })

    # Sort leaderboard by streak desc, then total_submissions desc
    leaderboard.sort(key=lambda x: (x["streak"], x["total_submissions"], x["reactions_received"]), reverse=True)

    # Assign ranks
    for idx, item in enumerate(leaderboard):
        item["rank"] = idx + 1

    group_streak = calculate_group_streak(group_id, db)

    return {
        "group_id": group_id,
        "group_streak": group_streak,
        "leaderboard": leaderboard
    }

class ApplyRescueRequest(BaseModel):
    user_id: int
    group_id: int
    reason: str

class ReviewRescueRequest(BaseModel):
    rescue_id: int
    admin_id: int
    action: str # approve or reject

@router.post("/rescue/apply")
def apply_streak_rescue(data: ApplyRescueRequest, db: Session = Depends(get_db)):
    target_date = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    
    # Check if already applied
    existing = db.query(StreakRescue).filter(
        StreakRescue.user_id == data.user_id,
        StreakRescue.group_id == data.group_id,
        StreakRescue.target_date == target_date,
        StreakRescue.status == "pending"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Pending streak rescue request already exists for this date.")

    rescue = StreakRescue(
        user_id=data.user_id,
        group_id=data.group_id,
        target_date=target_date,
        reason=data.reason,
        status="pending"
    )
    db.add(rescue)
    db.commit()
    db.refresh(rescue)

    return {"message": "Streak rescue application submitted! An admin will review your request.", "rescue_id": rescue.id}

@router.get("/rescue/list")
def list_streak_rescues(db: Session = Depends(get_db)):
    rescues = db.query(StreakRescue).order_by(StreakRescue.created_at.desc()).all()
    result = []
    for r in rescues:
        user = db.query(User).filter(User.id == r.user_id).first()
        group = db.query(Group).filter(Group.id == r.group_id).first()
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "username": user.username if user else "Unknown",
            "display_name": user.display_name if user else "Unknown",
            "avatar_url": user.avatar_url if user else "",
            "group_name": group.name if group else "Unknown",
            "target_date": r.target_date,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at.isoformat()
        })
    return result

@router.post("/rescue/review")
def review_streak_rescue(data: ReviewRescueRequest, db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == data.admin_id).first()
    if not admin or not admin.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required to review streak rescues.")

    rescue = db.query(StreakRescue).filter(StreakRescue.id == data.rescue_id).first()
    if not rescue:
        raise HTTPException(status_code=404, detail="Rescue request not found")

    if data.action.lower() == "approve":
        rescue.status = "approved"
        rescue.reviewed_by = admin.id

        # Insert a dummy submission for that missed date if approved
        existing_sub = db.query(DailySubmission).filter(
            DailySubmission.user_id == rescue.user_id,
            DailySubmission.group_id == rescue.group_id,
            DailySubmission.submission_date == rescue.target_date
        ).first()

        if not existing_sub:
            # Use song #1 or existing song
            sub = DailySubmission(
                user_id=rescue.user_id,
                group_id=rescue.group_id,
                song_id=1,
                submission_date=rescue.target_date
            )
            db.add(sub)

        db.commit()
        return {"message": "Streak rescue approved! Submission restored."}
    else:
        rescue.status = "rejected"
        rescue.reviewed_by = admin.id
        db.commit()
        return {"message": "Streak rescue rejected."}
