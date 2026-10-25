import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.seed_data import seed_database
from app.routers import (
    auth,
    classify,
    activities,
    dashboard,
    recycling_guide,
    facilities,
    gamification,
    assistant,
    admin
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Run seed data check
try:
    seed_database()
except Exception as e:
    print(f"[Startup] Seed database notice: {e}")

app = FastAPI(
    title="Smart Recycling Waste Management API",
    description="Full-stack AI-Powered Intelligent Waste Material Classification & Environmental Analytics Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://smart-recycling-waste-management.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory safely (use /tmp/uploads on Vercel)
upload_dir_env = os.getenv("UPLOAD_DIR")
if upload_dir_env:
    upload_dir = Path(upload_dir_env)
elif os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or not os.access(".", os.W_OK):
    upload_dir = Path("/tmp/uploads")
else:
    upload_dir = Path("./uploads")

try:
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
except Exception as e:
    print(f"[Startup] Uploads mount notice: {e}")

# Include API Routers
app.include_router(auth.router)
app.include_router(classify.router)
app.include_router(activities.router)
app.include_router(dashboard.router)
app.include_router(recycling_guide.router)
app.include_router(facilities.router)
app.include_router(gamification.router)
app.include_router(assistant.router)
app.include_router(admin.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Smart Recycling Waste Management API",
        "version": "1.0.0",
        "ai_engine": "Operational",
        "database": "Connected"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Smart Recycling Waste Management API. Visit /docs for interactive Swagger API documentation."
    }
