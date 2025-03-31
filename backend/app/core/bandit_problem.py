"""Implementation of the multi-armed bandit problem."""
from typing import List
from app.core.distributions import RewardDistribution

class Arm:
    """Represents a single arm in a multi-armed bandit problem."""
    
    def __init__(self, distribution: RewardDistribution):
        """
        Initialize an arm with a reward distribution.
        
        Args:
            distribution: The arm's reward distribution
        """
        self.distribution = distribution
    
    def pull(self) -> float:
        """
        Pull this arm and get a reward.
        
        Returns:
            A reward sampled from the arm's distribution
        """
        return self.distribution.sample()
    
    def get_true_mean(self) -> float:
        """
        Get the true mean reward of this arm.
        
        Returns:
            The true mean reward
        """
        return self.distribution.get_mean()

class BanditProblem:
    """Represents a multi-armed bandit problem with multiple arms."""
    
    def __init__(self, distributions: List[RewardDistribution]):
        """
        Initialize a bandit problem with the given arm distributions.
        
        Args:
            distributions: List of reward distributions, one for each arm
        """
        self.arms = [Arm(dist) for dist in distributions]
    
    def get_num_arms(self) -> int:
        """
        Get the number of arms in this bandit problem.
        
        Returns:
            The number of arms
        """
        return len(self.arms)
    
    def pull_arm(self, arm_index: int) -> float:
        """
        Pull the arm at the given index.
        
        Args:
            arm_index: The index of the arm to pull
        
        Returns:
            The reward from pulling the arm
        
        Raises:
            IndexError: If arm_index is out of range
        """
        if arm_index < 0 or arm_index >= len(self.arms):
            raise IndexError(f"Arm index {arm_index} out of range (0-{len(self.arms)-1})")
        
        return self.arms[arm_index].pull()
    
    def get_optimal_arm_mean(self) -> float:
        """
        Get the highest true mean reward among all arms.
        
        Returns:
            The highest true mean reward
        """
        return max(arm.get_true_mean() for arm in self.arms)
    
    def get_optimal_arm_index(self) -> int:
        """
        Get the index of the arm with the highest true mean reward.
        
        Returns:
            The index of the optimal arm
        """
        means = [arm.get_true_mean() for arm in self.arms]
        return means.index(max(means)) 