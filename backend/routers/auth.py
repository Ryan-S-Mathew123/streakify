from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserCreate(BaseModel):
    username: str
    display_name: str
    email: str
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str
    email: str
    avatar_url: Optional[str]
    is_admin: bool

    class Config:
        from_attributes = True

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/login", response_model=UserResponse)
def login(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Auto-create if not exists for fast demo experience
        user = User(
            username=username,
            display_name=username.capitalize(),
            email=f"{username}@songstreak.com",
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            is_admin=(username.lower() == "admin" or username.lower() == "ryan")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    avatar = user_data.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.username}"
    new_user = User(
        username=user_data.username,
        display_name=user_data.display_name,
        email=user_data.email,
        avatar_url=avatar,
        is_admin=user_data.username.lower() in ["admin", "ryan"]
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
