import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User, UserChallenge
from app.schemas import UserRegister, UserLogin, UserOut, Token, PasswordResetRequest, PasswordResetConfirm
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

INITIAL_CHALLENGES = [
    {
        "challenge_code": "scan_first_waste",
        "title": "First Scan",
        "description": "Identify your first waste item using the AI Scanner.",
        "category": "Scanner",
        "target": 1,
        "points_reward": 50
    },
    {
        "challenge_code": "scan_five_items",
        "title": "Waste Detective",
        "description": "Scan and identify 5 different waste items.",
        "category": "Scanner",
        "target": 5,
        "points_reward": 100
    },
    {
        "challenge_code": "log_three_recyclings",
        "title": "Recycling Habit",
        "description": "Record 3 self-reported recycling activities.",
        "category": "Recycling",
        "target": 3,
        "points_reward": 150
    },
    {
        "challenge_code": "explore_guides",
        "title": "Eco Scholar",
        "description": "Explore the complete recycling guide to learn segregation rules.",
        "category": "Education",
        "target": 1,
        "points_reward": 75
    }
]

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role="user",
        eco_points=100  # Welcome bonus
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize default user challenges
    for ch in INITIAL_CHALLENGES:
        db.add(UserChallenge(
            user_id=user.id,
            challenge_code=ch["challenge_code"],
            title=ch["title"],
            description=ch["description"],
            category=ch["category"],
            target=ch["target"],
            progress=0,
            is_completed=False,
            points_reward=ch["points_reward"]
        ))
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token login for Swagger documentation"""
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Prevent user enumeration
        return {"message": "If this email is registered, password reset instructions have been generated."}
    
    reset_token = create_access_token(
        data={"sub": str(user.id), "scope": "password_reset"},
        expires_delta=datetime.timedelta(hours=1)
    )
    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token,
        "instructions": "In local academic development, pass this reset_token to /reset-password."
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    try:
        from app.auth import SECRET_KEY, ALGORITHM
        from jose import jwt
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        scope = payload.get("scope")
        if not user_id or scope != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
    except Exception:
        raise HTTPException(status_code=400, detail="Expired or invalid reset token")
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password has been successfully updated. You may now sign in."}
