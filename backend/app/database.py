import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Default to /tmp SQLite on Vercel serverless environment (where root is read-only)
is_vercel = bool(os.getenv("VERCEL"))
default_db = "sqlite:////tmp/waste_management.db" if is_vercel else "sqlite:///./waste_management.db"

DATABASE_URL = os.getenv("DATABASE_URL", default_db)

# Normalize postgres:// to postgresql:// for SQLAlchemy 2.0+ compatibility (e.g. from Neon / Supabase)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite connection args
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
