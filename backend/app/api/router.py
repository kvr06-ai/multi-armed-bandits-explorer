from fastapi import APIRouter, HTTPException
from app.api.endpoints import config, simulations

router = APIRouter()

# Include all API endpoints
router.include_router(config.router, prefix="/config", tags=["config"])
router.include_router(simulations.router, prefix="/simulations", tags=["simulations"]) 