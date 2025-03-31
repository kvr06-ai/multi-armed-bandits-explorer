"""Simulation runner for multi-armed bandit problems."""
import numpy as np
from typing import Dict, List, Any
from app.core.bandit_problem import BanditProblem
from app.core.algorithms import Algorithm

class SimulationRunner:
    """Runs simulations of multi-armed bandit algorithms."""
    
    def run(
        self,
        problem: BanditProblem,
        algorithm: Algorithm,
        num_steps: int,
        num_runs: int
    ) -> Dict[str, Any]:
        """
        Run a simulation of a multi-armed bandit problem with a given algorithm.
        
        Args:
            problem: The bandit problem to solve
            algorithm: The algorithm to use
            num_steps: Number of steps (arm pulls) per run
            num_runs: Number of independent runs to average over
            
        Returns:
            Dictionary with simulation results
        """
        # Set up arrays to store results
        num_arms = problem.get_num_arms()
        steps = np.arange(1, num_steps + 1)
        optimal_mean = problem.get_optimal_arm_mean()
        
        # Arrays for storing results across runs
        rewards = np.zeros((num_runs, num_steps))  # Rewards for each step in each run
        chosen_arms = np.zeros((num_runs, num_steps), dtype=np.int32)  # Chosen arm for each step in each run
        
        # Run simulations
        for run in range(num_runs):
            # Reset algorithm state for new run
            algorithm.reset()
            
            # Track cumulative reward for this run
            cumulative_reward = 0
            
            for step in range(num_steps):
                # Select arm according to algorithm
                arm_index = algorithm.select_arm()
                chosen_arms[run, step] = arm_index
                
                # Pull the arm and get reward
                reward = problem.pull_arm(arm_index)
                rewards[run, step] = reward
                
                # Update algorithm's state
                algorithm.update(arm_index, reward)
        
        # Calculate results
        # Per-step rewards
        avg_rewards = np.mean(rewards, axis=0)
        stddev_rewards = np.std(rewards, axis=0) if num_runs > 1 else None
        
        # Cumulative rewards
        cumulative_rewards = np.cumsum(rewards, axis=1)
        avg_cumulative_rewards = np.mean(cumulative_rewards, axis=0)
        stddev_cumulative_rewards = np.std(cumulative_rewards, axis=0) if num_runs > 1 else None
        
        # Per-step average rewards (cumulative / step_number)
        avg_reward_per_step = np.zeros_like(cumulative_rewards)
        for run in range(num_runs):
            for step in range(num_steps):
                avg_reward_per_step[run, step] = cumulative_rewards[run, step] / (step + 1)
        avg_average_reward = np.mean(avg_reward_per_step, axis=0)
        stddev_average_reward = np.std(avg_reward_per_step, axis=0) if num_runs > 1 else None
        
        # Regret
        # For each step, regret is the difference between optimal reward and received reward
        regrets = np.full_like(rewards, optimal_mean) - rewards
        cumulative_regrets = np.cumsum(regrets, axis=1)
        avg_cumulative_regrets = np.mean(cumulative_regrets, axis=0)
        stddev_cumulative_regrets = np.std(cumulative_regrets, axis=0) if num_runs > 1 else None
        
        # Arm counts
        arm_counts = np.zeros((num_runs, num_arms))
        for run in range(num_runs):
            for arm in range(num_arms):
                arm_counts[run, arm] = np.sum(chosen_arms[run, :] == arm)
        avg_arm_counts = np.mean(arm_counts, axis=0)
        
        # Average results over all runs
        result = {
            "steps": steps.tolist(),
            "avg_cumulative_reward": avg_cumulative_rewards.tolist(),
            "avg_cumulative_regret": avg_cumulative_regrets.tolist(),
            "avg_average_reward": avg_average_reward.tolist(),
            "avg_arm_counts": [
                {"arm_index": i, "count": float(count)}
                for i, count in enumerate(avg_arm_counts)
            ]
        }
        
        # Add standard deviations if we have multiple runs
        if num_runs > 1:
            result["stddev_cumulative_reward"] = stddev_cumulative_rewards.tolist()
            result["stddev_cumulative_regret"] = stddev_cumulative_regrets.tolist()
            result["stddev_average_reward"] = stddev_average_reward.tolist()
        
        return result 