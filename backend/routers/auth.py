import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..circle import ensure_main_circle
from ..database import get_db
from ..models import User
from ..security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=12, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class RegisterRequest(Credentials):
    display_name: str = Field(min_length=2, max_length=60)

    @field_validator("display_name")
    @classmethod
    def normalize_display_name(cls, value: str) -> str:
        return value.strip()


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    email: str
    avatar_url: str | None


def username_for_email(email: str, db: Session) -> str:
    base = re.sub(r"[^a-z0-9_]", "", email.split("@", 1)[0].lower())[:20] or "member"
    username = base
    while db.query(User.id).filter(User.username == username).first():
        username = f"{base[:15]}_{secrets.token_hex(2)}"
    return username


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email).first()
    if user and user.password_hash:
        raise HTTPException(status_code=409, detail="An account already uses this email. Sign in instead.")

    if user is None:
        user = User(
            username=username_for_email(data.email, db),
            display_name=data.display_name,
            email=data.email,
            is_admin=False,
        )
        db.add(user)
        db.flush()
    else:
        user.display_name = data.display_name

    user.password_hash = hash_password(data.password)
    ensure_main_circle(db, user.id)
    db.commit()
    db.refresh(user)
    request.session.clear()
    request.session["user_id"] = user.id
    return user


@router.post("/login", response_model=UserResponse)
def login(data: Credentials, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    ensure_main_circle(db, user.id)
    db.commit()
    request.session.clear()
    request.session["user_id"] = user.id
    return user


@router.get("/me", response_model=UserResponse | None)
def current_session(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        request.session.clear()
    return user


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Signed out."}