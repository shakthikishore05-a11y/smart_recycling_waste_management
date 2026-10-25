from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, WasteScan, RecyclingActivity, RecyclingFacility, RecyclingGuide
from app.schemas import UserOut, FacilityOut, FacilityCreate, RecyclingGuideOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/v1/admin", tags=["Administrator Dashboard"])

@router.get("/stats")
def get_admin_system_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_scans = db.query(WasteScan).count()
    total_activities = db.query(RecyclingActivity).count()
    total_weight = db.query(func.sum(RecyclingActivity.weight_kg)).scalar() or 0.0
    total_facilities = db.query(RecyclingFacility).count()
    
    # Corrections reported
    corrections_count = db.query(WasteScan).filter(WasteScan.user_feedback_category != None).count()
    
    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "total_activities": total_activities,
        "total_weight_kg": round(total_weight, 2),
        "total_facilities": total_facilities,
        "feedback_corrections_submitted": corrections_count,
        "model_architecture": "MobileNetV3 / Vision-MLP Classifier",
        "model_status": "Operational",
        "dataset_standard": "TrashNet (6 Classes)"
    }

@router.get("/users", response_model=List[Dict[str, Any]])
def list_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    user_list = []
    
    for u in users:
        scans_count = db.query(WasteScan).filter(WasteScan.user_id == u.id).count()
        acts_count = db.query(RecyclingActivity).filter(RecyclingActivity.user_id == u.id).count()
        user_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "eco_points": u.eco_points,
            "scans_count": scans_count,
            "activities_count": acts_count,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else ""
        })
    return user_list

@router.get("/scans", response_model=List[Dict[str, Any]])
def list_recent_scans_across_platform(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    scans = db.query(WasteScan).order_by(WasteScan.created_at.desc()).limit(50).all()
    result = []
    for s in scans:
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "image_path": s.image_path,
            "predicted_category": s.predicted_category,
            "display_name": s.display_name,
            "confidence": s.confidence,
            "is_confident": s.is_confident,
            "user_feedback_category": s.user_feedback_category,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else ""
        })
    return result

@router.post("/facilities", response_model=FacilityOut, status_code=status.HTTP_201_CREATED)
def admin_create_facility(
    fac_in: FacilityCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    fac = RecyclingFacility(
        name=fac_in.name,
        address=fac_in.address,
        city=fac_in.city,
        state=fac_in.state,
        postal_code=fac_in.postal_code,
        phone=fac_in.phone,
        email=fac_in.email,
        website=fac_in.website,
        accepted_materials=fac_in.accepted_materials,
        is_verified=fac_in.is_verified,
        operating_hours=fac_in.operating_hours,
        notes=fac_in.notes
    )
    db.add(fac)
    db.commit()
    db.refresh(fac)
    return fac

@router.delete("/facilities/{facility_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    db.delete(fac)
    db.commit()
    return None
