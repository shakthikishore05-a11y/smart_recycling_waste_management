from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import User, UserChallenge, RecyclingActivity
from app.schemas import ChallengeOut, LeaderboardEntryOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/gamification", tags=["Gamification & Challenges"])

@router.get("/challenges", response_model=List[ChallengeOut])
def get_user_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenges = db.query(UserChallenge).filter(UserChallenge.user_id == current_user.id).all()
    return challenges

@router.get("/leaderboard", response_model=List[LeaderboardEntryOut])
def get_leaderboard(db: Session = Depends(get_db)):
    # Retrieve top users by eco-points
    top_users = db.query(User).order_by(User.eco_points.desc()).limit(15).all()
    leaderboard = []
    
    for rank, u in enumerate(top_users, start=1):
        act_count = db.query(RecyclingActivity).filter(RecyclingActivity.user_id == u.id).count()
        leaderboard.append({
            "rank": rank,
            "user_id": u.id,
            "full_name": u.full_name,
            "eco_points": u.eco_points,
            "activities_count": act_count
        })
        
    return leaderboard
