"""
Main entry point for Vercel and ASGI servers.
Exports the FastAPI app instance from app.main.
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
