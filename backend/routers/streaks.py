import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import DailySubmission, GroupMember, User, Reaction
from ..security import get_current_user

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
def get_group_streaks_overview(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first():
        raise HTTPException(status_code=403, detail="You are not a member of this circle.")
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
