"""Application settings."""
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Multi-Armed Bandit Explorer API"
    API_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173"]  # Frontend origin
    
settings = Settings() 