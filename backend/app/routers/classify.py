import os
import uuid
import csv
import io
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pathlib import Path

from app.database import get_db
from app.models import User, WasteScan, UserChallenge
from app.schemas import ScanOut, ScanFeedbackUpdate, PaginatedScansOut
from app.auth import get_current_user
from app.ml.classifier import get_classifier
from app.ml.model_def import TRASHNET_CLASSES

router = APIRouter(prefix="/api/v1", tags=["Waste Classification"])

upload_dir_env = os.getenv("UPLOAD_DIR")
if upload_dir_env:
    UPLOAD_DIR = Path(upload_dir_env)
elif os.getenv("VERCEL"):
    UPLOAD_DIR = Path("/tmp/uploads")
else:
    UPLOAD_DIR = Path("./uploads")

try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

def get_optional_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        from app.auth import SECRET_KEY, ALGORITHM
        from jose import jwt
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        return None
    return None

@router.post("/classify")
async def classify_waste_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if file.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.content_type}'. Please upload JPEG, PNG, or WebP images."
        )
        
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 5 MB ({len(contents) / (1024*1024):.2f} MB uploaded)."
        )
        
    classifier = get_classifier()
    try:
        prediction_result = classifier.predict(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image processing failed: {str(e)}"
        )
        
    # Save image to storage
    file_ext = Path(file.filename or "image.jpg").suffix.lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        file_ext = ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_file_path = UPLOAD_DIR / unique_filename
    
    with open(saved_file_path, "wb") as f:
        f.write(contents)
        
    web_image_path = f"/uploads/{unique_filename}"
    scan_id = None
    
    # Save to user history if authenticated
    if current_user:
        scan_record = WasteScan(
            user_id=current_user.id,
            image_path=web_image_path,
            original_filename=file.filename,
            predicted_category=prediction_result["predicted_category"],
            display_name=prediction_result["display_name"],
            confidence=prediction_result["confidence"],
            is_confident=prediction_result["is_confident"],
            model_identifier=prediction_result["model_identifier"],
            classification_type=prediction_result["classification_type"],
            recommendation_data=prediction_result
        )
        db.add(scan_record)
        
        # Award 10 points for performing a scan
        current_user.eco_points += 10
        
        # Update challenge progress
        scan_challenges = db.query(UserChallenge).filter(
            UserChallenge.user_id == current_user.id,
            UserChallenge.is_completed == False,
            UserChallenge.challenge_code.in_(["scan_first_waste", "scan_five_items"])
        ).all()
        
        total_scans = db.query(WasteScan).filter(WasteScan.user_id == current_user.id).count() + 1
        for ch in scan_challenges:
            ch.progress = min(ch.target, total_scans)
            if ch.progress >= ch.target:
                ch.is_completed = True
                ch.completed_at = datetime.datetime.utcnow()
                current_user.eco_points += ch.points_reward
                
        db.commit()
        db.refresh(scan_record)
        scan_id = scan_record.id
        
    return {
        "scan_id": scan_id,
        "image_url": web_image_path,
        "original_filename": file.filename,
        **prediction_result
    }

@router.get("/scans", response_model=PaginatedScansOut)
def list_user_scans(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("newest"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WasteScan).filter(WasteScan.user_id == current_user.id)
    
    if category and category != "all":
        query = query.filter(WasteScan.predicted_category == category.lower())
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (WasteScan.display_name.ilike(search_filter)) |
            (WasteScan.original_filename.ilike(search_filter)) |
            (WasteScan.notes.ilike(search_filter))
        )
        
    if sort_by == "oldest":
        query = query.order_by(WasteScan.created_at.asc())
    elif sort_by == "confidence":
        query = query.order_by(WasteScan.confidence.desc())
    else:
        query = query.order_by(WasteScan.created_at.desc())
        
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/scans/export/csv")
def export_scans_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scans = db.query(WasteScan).filter(WasteScan.user_id == current_user.id).order_by(WasteScan.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Scan ID", "Date", "Original Filename", "Predicted Category", "Display Name", "Confidence", "Classification Type", "User Correction", "Notes"])
    
    for s in scans:
        writer.writerow([
            s.id,
            s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else "",
            s.original_filename or "",
            s.predicted_category,
            s.display_name,
            f"{s.confidence * 100:.1f}%",
            s.classification_type or "",
            s.user_feedback_category or "None",
            s.notes or ""
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=my_waste_scans_{datetime.date.today()}.csv"}
    )

@router.get("/scans/{scan_id}", response_model=ScanOut)
def get_scan_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(WasteScan).filter(WasteScan.id == scan_id, WasteScan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return scan

@router.patch("/scans/{scan_id}/feedback", response_model=ScanOut)
def update_scan_feedback(
    scan_id: int,
    feedback: ScanFeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(WasteScan).filter(WasteScan.id == scan_id, WasteScan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
        
    if feedback.user_feedback_category is not None:
        scan.user_feedback_category = feedback.user_feedback_category
    if feedback.notes is not None:
        scan.notes = feedback.notes
        
    db.commit()
    db.refresh(scan)
    return scan

@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(WasteScan).filter(WasteScan.id == scan_id, WasteScan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
        
    # Safely delete image file if inside UPLOAD_DIR
    if scan.image_path and scan.image_path.startswith("/uploads/"):
        filename = scan.image_path.replace("/uploads/", "")
        file_to_delete = UPLOAD_DIR / filename
        if file_to_delete.exists():
            try:
                os.remove(file_to_delete)
            except Exception:
                pass
                
    db.delete(scan)
    db.commit()
    return None

@router.get("/model-info")
def get_model_info():
    metadata_path = Path("./app/ml/model_metadata.json")
    evaluation_path = Path("./app/ml/evaluation_results.json")
    
    metadata = {}
    if metadata_path.exists():
        import json
        with open(metadata_path, "r") as f:
            metadata = json.load(f)
            
    evaluation = {}
    if evaluation_path.exists():
        import json
        with open(evaluation_path, "r") as f:
            evaluation = json.load(f)
            
    return {
        "model_name": "Smart Recycling AI Classifier",
        "supported_classes": TRASHNET_CLASSES,
        "metadata": metadata,
        "evaluation": evaluation
    }
