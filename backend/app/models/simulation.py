from pydantic import BaseModel, Field, conlist, model_validator, RootModel
from typing import List, Dict, Any, Optional, Union, Literal

# Request Models
class DistributionParams(RootModel):
    """Generic container for distribution parameters"""
    root: Dict[str, Any] = {}
    
    def __getitem__(self, key):
        return self.root[key]
    
    def get(self, key, default=None):
        return self.root.get(key, default)

class DistributionConfig(BaseModel):
    id: str
    params: DistributionParams

class ArmConfig(BaseModel):
    distribution: DistributionConfig

class BanditProblemConfig(BaseModel):
    arms: List[ArmConfig] = Field(..., min_length=2)  # At least 2 arms

class AlgorithmParams(RootModel):
    """Generic container for algorithm parameters"""
    root: Dict[str, Any] = {}
    
    def __getitem__(self, key):
        return self.root[key]
    
    def get(self, key, default=None):
        return self.root.get(key, default)

class AlgorithmConfig(BaseModel):
    id: str
    params: AlgorithmParams

class SetupConfig(BaseModel):
    setup_id: str
    algorithm: AlgorithmConfig

class SimulationRequest(BaseModel):
    bandit_problem: BanditProblemConfig
    setups: List[SetupConfig] = Field(..., min_length=1)  # At least 1 setup
    num_steps: int = Field(..., gt=0)  # Greater than 0
    num_runs: Optional[int] = Field(1, gt=0)  # Greater than 0, default 1
    
    @model_validator(mode='after')
    def validate_request(self):
        if self.num_steps <= 0:
            raise ValueError('num_steps must be positive')
        if self.num_runs <= 0:
            raise ValueError('num_runs must be positive')
        return self

# Response Models
class ArmCount(BaseModel):
    arm_index: int
    count: float  # Float for avg across runs

class SimulationMetrics(BaseModel):
    steps: List[int]
    avg_cumulative_reward: List[float]
    stddev_cumulative_reward: Optional[List[float]]
    avg_cumulative_regret: List[float]
    stddev_cumulative_regret: Optional[List[float]]
    avg_average_reward: List[float]
    stddev_average_reward: Optional[List[float]]
    avg_arm_counts: List[ArmCount]
    raw_data_available: bool = True

class SimulationSummary(BaseModel):
    total_reward: float
    final_regret: float

class SimulationResult(BaseModel):
    setup_id: str
    metrics: SimulationMetrics
    summary: SimulationSummary

class SimulationResponse(BaseModel):
    results: List[SimulationResult] 