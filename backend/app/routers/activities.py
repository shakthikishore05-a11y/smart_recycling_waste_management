import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.database import get_db
from app.models import User, RecyclingActivity, UserChallenge
from app.schemas import ActivityCreate, ActivityUpdate, ActivityOut, PaginatedActivitiesOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/activities", tags=["Recycling Activities"])

def calculate_points_for_activity(category: str, weight_kg: float) -> int:
    """
    Validated backend rules for eco-point calculation:
    - Base: 15 points per kg
    - Material multiplier:
      - Metal: 1.5x (energy intensive to extract)
      - Plastic: 1.2x (high pollution risk)
      - Glass/Cardboard/Paper: 1.0x
    - Max reward per single activity: 200 points (prevents spam manipulation)
    """
    multiplier_map = {
        "metal": 1.5,
        "plastic": 1.2,
        "glass": 1.0,
        "paper": 1.0,
        "cardboard": 1.0,
        "organic": 0.8,
        "electronic": 2.0
    }
    mult = multiplier_map.get(category.lower(), 1.0)
    points = int(weight_kg * 15 * mult)
    return min(max(points, 5), 200)

@router.get("", response_model=PaginatedActivitiesOut)
def list_activities(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(RecyclingActivity).filter(RecyclingActivity.user_id == current_user.id)
    
    if category and category != "all":
        query = query.filter(RecyclingActivity.category.ilike(category))
        
    query = query.order_by(RecyclingActivity.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    points = calculate_points_for_activity(activity_in.category, activity_in.weight_kg)
    
    activity = RecyclingActivity(
        user_id=current_user.id,
        category=activity_in.category,
        material_type=activity_in.material_type,
        weight_kg=round(activity_in.weight_kg, 2),
        activity_date=activity_in.activity_date,
        disposal_method=activity_in.disposal_method,
        notes=activity_in.notes,
        points_earned=points
    )
    db.add(activity)
    
    # Award points to user
    current_user.eco_points += points
    
    # Update challenge progress
    ch = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.challenge_code == "log_three_recyclings",
        UserChallenge.is_completed == False
    ).first()
    
    if ch:
        total_acts = db.query(RecyclingActivity).filter(RecyclingActivity.user_id == current_user.id).count() + 1
        ch.progress = min(ch.target, total_acts)
        if ch.progress >= ch.target:
            ch.is_completed = True
            ch.completed_at = datetime.datetime.utcnow()
            current_user.eco_points += ch.points_reward
            
    db.commit()
    db.refresh(activity)
    return activity

@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    act = db.query(RecyclingActivity).filter(
        RecyclingActivity.id == activity_id,
        RecyclingActivity.user_id == current_user.id
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity record not found")
    return act

@router.patch("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    activity_in: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    act = db.query(RecyclingActivity).filter(
        RecyclingActivity.id == activity_id,
        RecyclingActivity.user_id == current_user.id
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity record not found")
        
    if activity_in.category is not None:
        act.category = activity_in.category
    if activity_in.material_type is not None:
        act.material_type = activity_in.material_type
    if activity_in.weight_kg is not None:
        # Adjust points difference
        old_points = act.points_earned
        new_points = calculate_points_for_activity(act.category, activity_in.weight_kg)
        point_diff = new_points - old_points
        current_user.eco_points += point_diff
        act.points_earned = new_points
        act.weight_kg = round(activity_in.weight_kg, 2)
    if activity_in.activity_date is not None:
        act.activity_date = activity_in.activity_date
    if activity_in.disposal_method is not None:
        act.disposal_method = activity_in.disposal_method
    if activity_in.notes is not None:
        act.notes = activity_in.notes
        
    db.commit()
    db.refresh(act)
    return act

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    act = db.query(RecyclingActivity).filter(
        RecyclingActivity.id == activity_id,
        RecyclingActivity.user_id == current_user.id
    ).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity record not found")
        
    # Reclaim points from deleted self-report
    current_user.eco_points = max(0, current_user.eco_points - act.points_earned)
    db.delete(act)
    db.commit()
    return None
