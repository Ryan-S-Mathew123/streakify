import random
import string
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..models import Group, GroupMember, User

router = APIRouter(prefix="/api/groups", tags=["groups"])

DAY_THEMES = {
    0: "🎸 Your favorite guitar song",     # Monday
    1: "💔 A song that reminds you of someone", # Tuesday
    2: "🔥 Your current obsession",       # Wednesday
    3: "🕰️ A nostalgic song",             # Thursday
    4: "🥳 Your party song",              # Friday
    5: "🌙 Your late-night song",         # Saturday
    6: "❤️ Your comfort song"             # Sunday
}

class GroupCreate(BaseModel):
    name: str
    user_id: int

class JoinGroupRequest(BaseModel):
    invite_code: str
    user_id: int

@router.get("/user/{user_id}")
def get_user_groups(user_id: int, db: Session = Depends(get_db)):
    memberships = db.query(GroupMember).filter(GroupMember.user_id == user_id).all()
    group_ids = [m.group_id for m in memberships]
    groups = db.query(Group).filter(Group.id.in_(group_ids)).all()
    
    today_weekday = datetime.date.today().weekday()
    default_theme = DAY_THEMES.get(today_weekday, "🎵 Song of the Day")

    result = []
    for g in groups:
        member_count = db.query(GroupMember).filter(GroupMember.group_id == g.id).count()
        result.append({
            "id": g.id,
            "name": g.name,
            "invite_code": g.invite_code,
            "created_by_id": g.created_by_id,
            "theme_of_day": g.theme_override or default_theme,
            "member_count": member_count
        })
    return result

@router.get("/{group_id}")
def get_group_details(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    memberships = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    members_list = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        if user:
            members_list.append({
                "id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "joined_at": m.joined_at.isoformat()
            })

    today_weekday = datetime.date.today().weekday()
    default_theme = DAY_THEMES.get(today_weekday, "🎵 Song of the Day")

    return {
        "id": group.id,
        "name": group.name,
        "invite_code": group.invite_code,
        "created_by_id": group.created_by_id,
        "theme_of_day": group.theme_override or default_theme,
        "members": members_list
    }

@router.post("/create")
def create_group(data: GroupCreate, db: Session = Depends(get_db)):
    code_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    invite_code = f"SONG-{code_suffix}"
    
    group = Group(
        name=data.name,
        invite_code=invite_code,
        created_by_id=data.user_id
    )
    db.add(group)
    db.flush()

    member = GroupMember(group_id=group.id, user_id=data.user_id)
    db.add(member)
    db.commit()
    db.refresh(group)
    return group

@router.post("/join")
def join_group(data: JoinGroupRequest, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.invite_code == data.invite_code.strip().upper()).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    existing = db.query(GroupMember).filter(
        GroupMember.group_id == group.id,
        GroupMember.user_id == data.user_id
    ).first()

    if not existing:
        member = GroupMember(group_id=group.id, user_id=data.user_id)
        db.add(member)
        db.commit()

    return {"message": "Successfully joined group", "group_id": group.id, "name": group.name}
