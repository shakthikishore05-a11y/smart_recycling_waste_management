from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import RecyclingGuide
from app.schemas import RecyclingGuideOut

router = APIRouter(prefix="/api/v1/recycling-guides", tags=["Recycling Guide"])

@router.get("", response_model=List[RecyclingGuideOut])
def list_guides(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(RecyclingGuide)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (RecyclingGuide.title.ilike(s)) |
            (RecyclingGuide.short_description.ilike(s)) |
            (RecyclingGuide.category_key.ilike(s))
        )
    return query.order_by(RecyclingGuide.id.asc()).all()

@router.get("/{category_key}", response_model=RecyclingGuideOut)
def get_guide_by_key(category_key: str, db: Session = Depends(get_db)):
    guide = db.query(RecyclingGuide).filter(RecyclingGuide.category_key == category_key.lower()).first()
    if not guide:
        raise HTTPException(status_code=404, detail=f"Guide for category '{category_key}' not found.")
    return guide
