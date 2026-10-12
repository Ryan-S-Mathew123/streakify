from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..circle import circle_response, ensure_main_circle
from ..database import get_db
from ..models import User
from ..security import get_current_user

router = APIRouter(prefix="/api/groups", tags=["circle"])


@router.get("/main")
def get_main_circle(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    circle = ensure_main_circle(db, user.id)
    response = circle_response(circle, db)
    db.commit()
    return response