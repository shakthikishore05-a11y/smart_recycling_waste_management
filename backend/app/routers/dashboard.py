import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, WasteScan, RecyclingActivity
from app.schemas import DashboardSummaryOut, CategoryCount, ActivityTrendItem
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["User Dashboard Analytics"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_scans = db.query(WasteScan).filter(WasteScan.user_id == current_user.id).count()
    total_activities = db.query(RecyclingActivity).filter(RecyclingActivity.user_id == current_user.id).count()
    
    total_weight = db.query(func.sum(RecyclingActivity.weight_kg)).filter(
        RecyclingActivity.user_id == current_user.id
    ).scalar() or 0.0
    
    # Most frequent category
    top_cat = db.query(
        WasteScan.predicted_category, 
        func.count(WasteScan.id).label("count")
    ).filter(
        WasteScan.user_id == current_user.id
    ).group_by(WasteScan.predicted_category).order_by(func.count(WasteScan.id).desc()).first()
    
    most_freq = top_cat[0].capitalize() if top_cat else "None"
    
    # Environmental metrics calculated directly from user's persisted recycling activities
    co2_saved = round(total_weight * 1.85, 2)  # Average 1.85 kg CO2e saved per kg recycled
    trees_saved = round(total_weight * 0.012, 3) # Equivalent trees preserved
    water_saved = round(total_weight * 26.5, 1)  # Litres of fresh water conserved
    
    return {
        "total_images_classified": total_scans,
        "total_recycling_activities": total_activities,
        "total_recycled_weight_kg": round(total_weight, 2),
        "eco_points_balance": current_user.eco_points,
        "most_frequent_category": most_freq,
        "co2_saved_kg": co2_saved,
        "trees_equivalent": trees_saved,
        "water_saved_liters": water_saved
    }

@router.get("/category-distribution", response_model=List[CategoryCount])
def get_category_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scans_by_cat = db.query(
        WasteScan.predicted_category,
        func.count(WasteScan.id).label("count")
    ).filter(
        WasteScan.user_id == current_user.id
    ).group_by(WasteScan.predicted_category).all()
    
    total_scans = sum(item[1] for item in scans_by_cat)
    
    if total_scans == 0:
        return []
        
    return [
        {
            "category": item[0].capitalize(),
            "count": item[1],
            "percentage": round((item[1] / total_scans) * 100, 1)
        }
        for item in scans_by_cat
    ]

@router.get("/activity-trend", response_model=List[ActivityTrendItem])
def get_activity_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve past 7 days of activity
    today = datetime.date.today()
    result = []
    
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_label = day.strftime("%a (%b %d)")
        
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        
        scans_count = db.query(WasteScan).filter(
            WasteScan.user_id == current_user.id,
            WasteScan.created_at >= day_start,
            WasteScan.created_at <= day_end
        ).count()
        
        acts = db.query(RecyclingActivity).filter(
            RecyclingActivity.user_id == current_user.id,
            RecyclingActivity.activity_date == day_str
        ).all()
        
        acts_count = len(acts)
        weight_sum = sum(a.weight_kg for a in acts)
        
        result.append({
            "date": day_label,
            "scans": scans_count,
            "activities": acts_count,
            "weight_kg": round(weight_sum, 2)
        })
        
    return result
