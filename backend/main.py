from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import importlib.util
import os
import sys

from app.api.router import router as api_router

# Try to import settings, or create default settings if module doesn't exist
try:
    from app.core.settings import settings
except ImportError:
    # Use default settings
    class Settings:
        PROJECT_NAME = "Multi-Armed Bandit Explorer API"
        API_PREFIX = "/api/v1"
        BACKEND_CORS_ORIGINS = ["http://localhost:5173"]
    
    settings = Settings()
    
    # Create the settings module
    settings_path = os.path.join(os.path.dirname(__file__), "app", "core", "settings.py")
    if not os.path.exists(settings_path):
        os.makedirs(os.path.dirname(settings_path), exist_ok=True)
        with open(settings_path, "w") as f:
            f.write("""\"\"\"Application settings.\"\"\"
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Multi-Armed Bandit Explorer API"
    API_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173"]  # Frontend origin
    
settings = Settings()
""")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for running multi-armed bandit simulations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 