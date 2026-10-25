from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import RecyclingFacility
from app.schemas import FacilityOut

router = APIRouter(prefix="/api/v1/facilities", tags=["Recycling Facilities Directory"])

@router.get("", response_model=List[FacilityOut])
def list_facilities(
    search: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(RecyclingFacility)
    
    if search:
        s = f"%{search}%"
        query = query.filter(
            (RecyclingFacility.name.ilike(s)) |
            (RecyclingFacility.address.ilike(s)) |
            (RecyclingFacility.postal_code.ilike(s)) |
            (RecyclingFacility.city.ilike(s))
        )
        
    if city and city != "all":
        query = query.filter(RecyclingFacility.city.ilike(f"%{city}%"))
        
    facilities = query.all()
    
    if material and material != "all":
        mat_lower = material.lower()
        facilities = [f for f in facilities if mat_lower in [m.lower() for m in f.accepted_materials]]
        
    return facilities

@router.get("/{facility_id}", response_model=FacilityOut)
def get_facility(facility_id: int, db: Session = Depends(get_db)):
    fac = db.query(RecyclingFacility).filter(RecyclingFacility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Recycling facility not found")
    return fac
