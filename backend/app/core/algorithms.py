"""Implementations of various multi-armed bandit algorithms."""
from abc import ABC, abstractmethod
import numpy as np
from scipy import stats
from typing import Dict, Any, List

class Algorithm(ABC):
    """Abstract base class for MAB algorithms."""
    
    def __init__(self, num_arms: int, params: Dict[str, Any]):
        """
        Initialize the algorithm.
        
        Args:
            num_arms: Number of arms in the bandit problem
            params: Algorithm-specific parameters
        """
        self.num_arms = num_arms
        self.params = params
    
    @abstractmethod
    def select_arm(self) -> int:
        """
        Select which arm to pull next.
        
        Returns:
            The index of the selected arm
        """
        pass
    
    @abstractmethod
    def update(self, chosen_arm: int, reward: float) -> None:
        """
        Update the algorithm's internal state with the result of the latest pull.
        
        Args:
            chosen_arm: The index of the arm that was pulled
            reward: The reward that was received
        """
        pass
    
    @abstractmethod
    def reset(self) -> None:
        """Reset the algorithm's state for a new run."""
        pass

class EpsilonGreedyAlgorithm(Algorithm):
    """Epsilon-Greedy algorithm for MAB problems."""
    
    def __init__(self, num_arms: int, params: Dict[str, Any]):
        """
        Initialize Epsilon-Greedy algorithm.
        
        Args:
            num_arms: Number of arms in the bandit problem
            params: Dictionary with key 'epsilon' for exploration probability
        """
        super().__init__(num_arms, params)
        self.epsilon = params.get('epsilon', 0.1)
        if not 0 <= self.epsilon <= 1:
            raise ValueError(f"Epsilon must be between 0 and 1, got {self.epsilon}")
        self.reset()
    
    def reset(self) -> None:
        """Reset the algorithm's state for a new run."""
        # For each arm, track the sum of rewards and number of pulls
        self.reward_sums = np.zeros(self.num_arms)
        self.arm_counts = np.zeros(self.num_arms)
    
    def select_arm(self) -> int:
        """
        Select an arm according to Epsilon-Greedy policy.
        
        With probability epsilon, choose a random arm.
        With probability 1-epsilon, choose the arm with highest estimated value.
        
        Returns:
            The index of the selected arm
        """
        # With probability epsilon, explore (random arm)
        if np.random.random() < self.epsilon:
            return np.random.randint(self.num_arms)
        
        # With probability 1-epsilon, exploit (best estimated arm)
        # If an arm hasn't been pulled yet, its estimated value is 0
        # Break ties randomly
        estimates = np.zeros(self.num_arms)
        for i in range(self.num_arms):
            if self.arm_counts[i] > 0:
                estimates[i] = self.reward_sums[i] / self.arm_counts[i]
        
        # Find all arms with the max estimated value
        max_value = np.max(estimates)
        best_arms = np.where(estimates == max_value)[0]
        
        # Choose randomly among the best arms
        return np.random.choice(best_arms)
    
    def update(self, chosen_arm: int, reward: float) -> None:
        """
        Update the algorithm's state with the result of the latest pull.
        
        Args:
            chosen_arm: The index of the arm that was pulled
            reward: The reward that was received
        """
        self.reward_sums[chosen_arm] += reward
        self.arm_counts[chosen_arm] += 1

class UCB1Algorithm(Algorithm):
    """Upper Confidence Bound (UCB1) algorithm for MAB problems."""
    
    def __init__(self, num_arms: int, params: Dict[str, Any]):
        """
        Initialize UCB1 algorithm.
        
        Args:
            num_arms: Number of arms in the bandit problem
            params: Dictionary with key 'c' for exploration coefficient
        """
        super().__init__(num_arms, params)
        self.c = params.get('c', 1.414)  # Default to sqrt(2)
        if self.c < 0:
            raise ValueError(f"UCB1 exploration coefficient must be non-negative, got {self.c}")
        self.reset()
    
    def reset(self) -> None:
        """Reset the algorithm's state for a new run."""
        self.reward_sums = np.zeros(self.num_arms)
        self.arm_counts = np.zeros(self.num_arms)
        self.total_pulls = 0
    
    def select_arm(self) -> int:
        """
        Select an arm according to UCB1 policy.
        
        Choose the arm with the highest upper confidence bound:
        UCB = empirical_mean + c * sqrt(log(total_pulls) / arm_pulls)
        
        Returns:
            The index of the selected arm
        """
        # If any arm hasn't been pulled, pull it
        for i in range(self.num_arms):
            if self.arm_counts[i] == 0:
                return i
        
        # Calculate UCB for each arm
        ucb_values = np.zeros(self.num_arms)
        for i in range(self.num_arms):
            empirical_mean = self.reward_sums[i] / self.arm_counts[i]
            exploration_bonus = self.c * np.sqrt(np.log(self.total_pulls) / self.arm_counts[i])
            ucb_values[i] = empirical_mean + exploration_bonus
        
        # Choose the arm with the highest UCB
        # Break ties randomly
        max_value = np.max(ucb_values)
        best_arms = np.where(ucb_values == max_value)[0]
        return np.random.choice(best_arms)
    
    def update(self, chosen_arm: int, reward: float) -> None:
        """
        Update the algorithm's state with the result of the latest pull.
        
        Args:
            chosen_arm: The index of the arm that was pulled
            reward: The reward that was received
        """
        self.reward_sums[chosen_arm] += reward
        self.arm_counts[chosen_arm] += 1
        self.total_pulls += 1

class ThompsonSamplingAlgorithm(Algorithm):
    """Thompson Sampling algorithm for MAB problems with Bernoulli rewards."""
    
    def __init__(self, num_arms: int, params: Dict[str, Any]):
        """
        Initialize Thompson Sampling algorithm.
        
        Args:
            num_arms: Number of arms in the bandit problem
            params: Not used in this algorithm
        """
        super().__init__(num_arms, params)
        self.reset()
    
    def reset(self) -> None:
        """Reset the algorithm's state for a new run."""
        # For each arm, we track alpha and beta parameters of Beta distribution
        # Initial prior: Beta(1, 1) - uniform over [0, 1]
        self.alphas = np.ones(self.num_arms)
        self.betas = np.ones(self.num_arms)
    
    def select_arm(self) -> int:
        """
        Select an arm according to Thompson Sampling policy.
        
        For each arm, sample a value from its Beta distribution.
        Choose the arm with the highest sampled value.
        
        Returns:
            The index of the selected arm
        """
        samples = np.zeros(self.num_arms)
        for i in range(self.num_arms):
            samples[i] = np.random.beta(self.alphas[i], self.betas[i])
        
        # Choose the arm with the highest sampled value
        # Break ties randomly
        max_value = np.max(samples)
        best_arms = np.where(samples == max_value)[0]
        return np.random.choice(best_arms)
    
    def update(self, chosen_arm: int, reward: float) -> None:
        """
        Update the algorithm's state with the result of the latest pull.
        
        Args:
            chosen_arm: The index of the arm that was pulled
            reward: The reward that was received
            
        Note: Assumes the reward is either 0 or 1 (Bernoulli reward)
        """
        # For binary rewards, increment alpha on success (reward=1)
        # and increment beta on failure (reward=0)
        if reward == 1:
            self.alphas[chosen_arm] += 1
        else:
            self.betas[chosen_arm] += 1

# Factory function to create algorithms
def create_algorithm(algorithm_id: str, num_arms: int, params: Dict[str, Any]) -> Algorithm:
    """
    Create an Algorithm instance based on the given ID and parameters.
    
    Args:
        algorithm_id: The ID of the algorithm type to create
        num_arms: Number of arms in the bandit problem
        params: Parameters for the algorithm
    
    Returns:
        An Algorithm instance
    
    Raises:
        ValueError: If the algorithm_id is not recognized
    """
    algorithms = {
        'epsilon_greedy': EpsilonGreedyAlgorithm,
        'ucb1': UCB1Algorithm,
        'thompson_sampling': ThompsonSamplingAlgorithm
    }
    
    if algorithm_id not in algorithms:
        raise ValueError(f"Unknown algorithm: {algorithm_id}")
    
    return algorithms[algorithm_id](num_arms, params) 