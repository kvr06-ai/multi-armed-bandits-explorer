"""Implementations of different reward distributions."""
from abc import ABC, abstractmethod
import numpy as np
from scipy import stats
from typing import Dict, Any

class RewardDistribution(ABC):
    """Abstract base class for reward distributions."""
    
    @abstractmethod
    def sample(self) -> float:
        """Sample a reward from this distribution."""
        pass
    
    @abstractmethod
    def get_mean(self) -> float:
        """Get the true mean of this distribution."""
        pass

class BernoulliDistribution(RewardDistribution):
    """Bernoulli distribution (0/1 rewards with probability p)."""
    
    def __init__(self, params: Dict[str, Any]):
        """
        Initialize a Bernoulli distribution.
        
        Args:
            params: Dictionary with key 'p' for success probability
        """
        self.p = params.get('p', 0.5)
        if not 0 <= self.p <= 1:
            raise ValueError(f"Bernoulli p must be between 0 and 1, got {self.p}")
    
    def sample(self) -> float:
        """Sample 0/1 with probability p of getting 1."""
        return float(np.random.binomial(1, self.p))
    
    def get_mean(self) -> float:
        """Mean of Bernoulli is p."""
        return self.p

class GaussianDistribution(RewardDistribution):
    """Gaussian (Normal) distribution with specified mean and standard deviation."""
    
    def __init__(self, params: Dict[str, Any]):
        """
        Initialize a Gaussian distribution.
        
        Args:
            params: Dictionary with keys 'mean' and 'stddev'
        """
        self.mean = params.get('mean', 0.0)
        self.stddev = params.get('stddev', 1.0)
        if self.stddev <= 0:
            raise ValueError(f"Gaussian stddev must be positive, got {self.stddev}")
    
    def sample(self) -> float:
        """Sample from normal distribution."""
        return float(np.random.normal(loc=self.mean, scale=self.stddev))
    
    def get_mean(self) -> float:
        """Mean of Gaussian is simply the mean parameter."""
        return self.mean

# Factory function to create distributions
def create_distribution(distribution_id: str, params: Dict[str, Any]) -> RewardDistribution:
    """
    Create a RewardDistribution instance based on the given ID and parameters.
    
    Args:
        distribution_id: The ID of the distribution type to create
        params: Parameters for the distribution
    
    Returns:
        A RewardDistribution instance
    
    Raises:
        ValueError: If the distribution_id is not recognized
    """
    distributions = {
        'bernoulli': BernoulliDistribution,
        'gaussian': GaussianDistribution
    }
    
    if distribution_id not in distributions:
        raise ValueError(f"Unknown distribution: {distribution_id}")
    
    return distributions[distribution_id](params) 