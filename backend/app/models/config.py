from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal

class ParameterDefinition(BaseModel):
    id: str
    name: str
    type: Literal["float", "int", "bool"]
    min: Optional[float] = None
    max: Optional[float] = None
    default: Any = None

class AlgorithmDefinition(BaseModel):
    id: str
    name: str
    params: List[ParameterDefinition] = []

class DistributionDefinition(BaseModel):
    id: str
    name: str
    params: List[ParameterDefinition] = [] 