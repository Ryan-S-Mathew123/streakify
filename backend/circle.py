import datetime

from sqlalchemy.orm import Session

from .models import Group, GroupMember, User

DAY_THEMES = {
    0: "Your favorite guitar song",
    1: "A song that reminds you of someone",
    2: "Your current obsession",
    3: "A nostalgic song",
    4: "Your party song",
    5: "Your late-night song",
    6: "Your comfort song",
}


def ensure_main_circle(db: Session, created_by_id: int | None = None) -> Group:
    circle = db.query(Group).order_by(Group.id).first()
    if circle is None:
        circle = Group(
            name="Streakify Circle",
            invite_code="STREAKIFY-MAIN",
            created_by_id=created_by_id,
        )
        db.add(circle)
        db.flush()
    elif circle.name != "Streakify Circle":
        circle.name = "Streakify Circle"

    memberships = {member.user_id for member in db.query(GroupMember).filter(GroupMember.group_id == circle.id).all()}
    for user in db.query(User).all():
        if user.id not in memberships:
            db.add(GroupMember(group_id=circle.id, user_id=user.id))
    db.flush()
    return circle


def circle_response(circle: Group, db: Session) -> dict:
    return {
        "id": circle.id,
        "name": "Streakify Circle",
        "invite_code": "",
        "created_by_id": circle.created_by_id,
        "theme_of_day": circle.theme_override or DAY_THEMES[datetime.date.today().weekday()],
        "member_count": db.query(GroupMember).filter(GroupMember.group_id == circle.id).count(),
    }