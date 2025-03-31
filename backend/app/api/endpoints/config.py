from fastapi import APIRouter
from typing import List
from app.models.config import AlgorithmDefinition, DistributionDefinition
from app.core.config import ALGORITHMS, DISTRIBUTIONS

router = APIRouter()

@router.get("/algorithms", response_model=List[AlgorithmDefinition])
async def get_algorithms():
    """Get available algorithms and their parameters."""
    return ALGORITHMS

@router.get("/distributions", response_model=List[DistributionDefinition])
async def get_distributions():
    """Get available reward distributions and their parameters."""
    return DISTRIBUTIONS 