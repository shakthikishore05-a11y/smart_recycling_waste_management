import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

# Authentication
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    eco_points: int
    avatar_url: Optional[str] = None
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Waste Classification & Scans
class ScanFeedbackUpdate(BaseModel):
    user_feedback_category: Optional[str] = None
    notes: Optional[str] = None

class ScanOut(BaseModel):
    id: int
    user_id: int
    image_path: str
    original_filename: Optional[str] = None
    predicted_category: str
    display_name: str
    confidence: float
    is_confident: bool
    model_identifier: str
    classification_type: Optional[str] = None
    user_feedback_category: Optional[str] = None
    notes: Optional[str] = None
    recommendation_data: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PaginatedScansOut(BaseModel):
    items: List[ScanOut]
    total: int
    page: int
    limit: int
    pages: int
    
    class Config:
        from_attributes = True

# Recycling Activities
class ActivityCreate(BaseModel):
    category: str
    material_type: str
    weight_kg: float = Field(..., gt=0, le=1000)
    activity_date: str  # YYYY-MM-DD
    disposal_method: str
    notes: Optional[str] = None

class ActivityUpdate(BaseModel):
    category: Optional[str] = None
    material_type: Optional[str] = None
    weight_kg: Optional[float] = Field(None, gt=0, le=1000)
    activity_date: Optional[str] = None
    disposal_method: Optional[str] = None
    notes: Optional[str] = None

class ActivityOut(BaseModel):
    id: int
    user_id: int
    category: str
    material_type: str
    weight_kg: float
    activity_date: str
    disposal_method: str
    notes: Optional[str] = None
    points_earned: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PaginatedActivitiesOut(BaseModel):
    items: List[ActivityOut]
    total: int
    page: int
    limit: int
    pages: int
    
    class Config:
        from_attributes = True

# Dashboard
class DashboardSummaryOut(BaseModel):
    total_images_classified: int
    total_recycling_activities: int
    total_recycled_weight_kg: float
    eco_points_balance: int
    most_frequent_category: str
    co2_saved_kg: float
    trees_equivalent: float
    water_saved_liters: float

class CategoryCount(BaseModel):
    category: str
    count: int
    percentage: float

class ActivityTrendItem(BaseModel):
    date: str
    scans: int
    activities: int
    weight_kg: float

# Facilities
class FacilityCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    postal_code: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    accepted_materials: List[str]
    is_verified: bool = True
    operating_hours: Optional[str] = None
    notes: Optional[str] = None

class FacilityOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str
    postal_code: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    accepted_materials: List[str]
    is_verified: bool
    operating_hours: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Recycling Guides
class RecyclingGuideOut(BaseModel):
    id: int
    category_key: str
    title: str
    short_description: str
    common_examples: List[str]
    disposal_method: str
    preparation_steps: List[str]
    reuse_ideas: List[str]
    common_mistakes: List[str]
    safety_precautions: List[str]
    local_acceptance_notes: str
    environmental_impact: str
    icon_name: str

    class Config:
        from_attributes = True

# Gamification
class ChallengeOut(BaseModel):
    id: int
    challenge_code: str
    title: str
    description: str
    category: str
    target: int
    progress: int
    is_completed: bool
    points_reward: int
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class LeaderboardEntryOut(BaseModel):
    rank: int
    user_id: int
    full_name: str
    eco_points: int
    activities_count: int

# AI Chatbot Assistant
class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
