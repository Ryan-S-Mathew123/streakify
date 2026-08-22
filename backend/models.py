import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    memberships = relationship("GroupMember", back_populates="user")
    submissions = relationship("DailySubmission", back_populates="user")
    reactions = relationship("Reaction", back_populates="user")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, index=True, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    theme_override = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    members = relationship("GroupMember", back_populates="group")
    submissions = relationship("DailySubmission", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint('group_id', 'user_id', name='_group_user_uc'),)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    spotify_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    artists = Column(String, nullable=False)
    album = Column(String, nullable=False)
    album_image_url = Column(String, nullable=True)
    spotify_url = Column(String, nullable=True)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submissions = relationship("DailySubmission", back_populates="song")

class DailySubmission(Base):
    __tablename__ = "daily_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    submission_date = Column(String, nullable=False) # Format: YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint('user_id', 'group_id', 'submission_date', name='_user_group_date_uc'),)

    user = relationship("User", back_populates="submissions")
    group = relationship("Group", back_populates="submissions")
    song = relationship("Song", back_populates="submissions")
    reactions = relationship("Reaction", back_populates="submission", cascade="all, delete-orphan")

class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("daily_submissions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emoji = Column(String, nullable=False) # ❤️, 🔥, 😭, 😂, 🤮
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint('submission_id', 'user_id', 'emoji', name='_sub_user_emoji_uc'),)

    submission = relationship("DailySubmission", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

class StreakRescue(Base):
    __tablename__ = "streak_rescues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    target_date = Column(String, nullable=False) # Format: YYYY-MM-DD
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WebcmdLog(Base):
    __tablename__ = "webcmd_logs"

    id = Column(Integer, primary_key=True, index=True)
    command = Column(String, nullable=False)
    query = Column(String, nullable=False)
    duration_ms = Column(Integer, nullable=False)
    status_code = Column(Integer, nullable=False)
    output_preview = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
