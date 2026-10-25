import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user" or "admin"
    eco_points = Column(Integer, default=0, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    scans = relationship("WasteScan", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("RecyclingActivity", back_populates="user", cascade="all, delete-orphan")
    challenges = relationship("UserChallenge", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class WasteScan(Base):
    __tablename__ = "waste_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    predicted_category = Column(String(100), nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    is_confident = Column(Boolean, default=True)
    model_identifier = Column(String(100), default="MobileNetV3-Small-TrashNet-v1.0")
    classification_type = Column(String(100), nullable=True)
    
    # User-confirmed correction/feedback
    user_feedback_category = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Store full recommendation JSON for history recall
    recommendation_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="scans")


class RecyclingActivity(Base):
    __tablename__ = "recycling_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    material_type = Column(String(100), nullable=False)
    weight_kg = Column(Float, nullable=False)  # User self-reported weight
    activity_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    disposal_method = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    points_earned = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="activities")


class RecyclingFacility(Base):
    __tablename__ = "recycling_facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    accepted_materials = Column(JSON, nullable=False)  # list of strings e.g. ["plastic", "glass", "paper"]
    is_verified = Column(Boolean, default=True)
    operating_hours = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RecyclingGuide(Base):
    __tablename__ = "recycling_guides"
    
    id = Column(Integer, primary_key=True, index=True)
    category_key = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(100), nullable=False)
    short_description = Column(Text, nullable=False)
    common_examples = Column(JSON, nullable=False)  # list of strings
    disposal_method = Column(Text, nullable=False)
    preparation_steps = Column(JSON, nullable=False)  # list of strings
    reuse_ideas = Column(JSON, nullable=False)  # list of strings
    common_mistakes = Column(JSON, nullable=False)  # list of strings
    safety_precautions = Column(JSON, nullable=False)  # list of strings
    local_acceptance_notes = Column(Text, nullable=False)
    environmental_impact = Column(Text, nullable=False)
    icon_name = Column(String(50), default="recycle")


class UserChallenge(Base):
    __tablename__ = "user_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    challenge_code = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    target = Column(Integer, default=1, nullable=False)
    progress = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False)
    points_reward = Column(Integer, default=50, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="challenges")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="chat_messages")
