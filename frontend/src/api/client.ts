import { BanditSimulator, BernoulliArm, GaussianArm, EpsilonGreedy, UCB1, ThompsonSampling } from '../utils/algorithms';

// Types
export interface AlgorithmParameter {
  id: string;
  name: string;
  type: string;
  min?: number;
  max?: number;
  default: number;
}

export interface Algorithm {
  id: string;
  name: string;
  params: AlgorithmParameter[];
}

export interface DistributionParameter {
  id: string;
  name: string;
  type: string;
  min?: number;
  max?: number;
  default: number;
}

export interface Distribution {
  id: string;
  name: string;
  params: DistributionParameter[];
}

export interface DistributionConfig {
  id: string;
  params: { [key: string]: number };
}

export interface ArmConfig {
  distribution: DistributionConfig;
}

export interface BanditProblemConfig {
  arms: ArmConfig[];
}

export interface AlgorithmConfig {
  id: string;
  params: { [key: string]: number };
}

export interface SetupConfig {
  setup_id: string;
  algorithm: AlgorithmConfig;
}

export interface SimulationRequest {
  bandit_problem: BanditProblemConfig;
  setups: SetupConfig[];
  num_steps: number;
  num_runs: number;
}

export interface ArmCountResult {
  arm_index: number;
  count: number;
}

export interface SimulationMetrics {
  steps: number[];
  avg_cumulative_reward: number[];
  stddev_cumulative_reward?: number[];
  avg_cumulative_regret: number[];
  stddev_cumulative_regret?: number[];
  avg_average_reward: number[];
  stddev_average_reward?: number[];
  avg_arm_counts: ArmCountResult[];
  raw_data_available: boolean;
}

export interface SimulationSummary {
  total_reward: number;
  final_regret: number;
}

export interface SimulationResult {
  setup_id: string;
  metrics: SimulationMetrics;
  summary: SimulationSummary;
}

export interface SimulationResponse {
  results: SimulationResult[];
}

// Available Algorithms
const ALGORITHMS: Algorithm[] = [
  {
    id: "epsilon_greedy",
    name: "Epsilon-Greedy",
    params: [
      {
        id: "epsilon",
        name: "Epsilon",
        type: "float",
        min: 0,
        max: 1,
        default: 0.1
      }
    ]
  },
  {
    id: "ucb1",
    name: "UCB1",
    params: [
      {
        id: "c",
        name: "Exploration Constant",
        type: "float",
        min: 0,
        default: 1.414  // sqrt(2)
      }
    ]
  },
  {
    id: "thompson_sampling",
    name: "Thompson Sampling",
    params: []  // No parameters
  }
];

// Available Distributions
const DISTRIBUTIONS: Distribution[] = [
  {
    id: "bernoulli",
    name: "Bernoulli",
    params: [
      {
        id: "p",
        name: "Probability (p)",
        type: "float",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },
  {
    id: "gaussian",
    name: "Gaussian",
    params: [
      {
        id: "mean",
        name: "Mean",
        type: "float",
        default: 0
      },
      {
        id: "stddev",
        name: "Standard Deviation",
        type: "float",
        min: 0.000001,  // Avoid zero
        default: 1
      }
    ]
  }
];

// Client API
export const API = {
  // Get available algorithms
  getAlgorithms: async (): Promise<Algorithm[]> => {
    return ALGORITHMS;
  },

  // Get available distributions
  getDistributions: async (): Promise<Distribution[]> => {
    return DISTRIBUTIONS;
  },

  // Run simulation
  runSimulation: async (request: SimulationRequest): Promise<SimulationResponse> => {
    // Create arms from bandit problem configuration
    const arms = request.bandit_problem.arms.map(arm => {
      const distConfig = arm.distribution;
      
      if (distConfig.id === 'bernoulli') {
        const p = distConfig.params['p'] || 0.5;
        return new BernoulliArm(p);
      } else if (distConfig.id === 'gaussian') {
        const mean = distConfig.params['mean'] || 0;
        const stddev = distConfig.params['stddev'] || 1;
        return new GaussianArm(mean, stddev);
      }
      
      // Default to Bernoulli with p=0.5
      return new BernoulliArm(0.5);
    });

    // Create simulator
    const simulator = new BanditSimulator(arms);

    // Add algorithms
    request.setups.forEach(setup => {
      const algorithmConfig = setup.algorithm;
      
      if (algorithmConfig.id === 'epsilon_greedy') {
        const epsilon = algorithmConfig.params['epsilon'] || 0.1;
        simulator.addAlgorithm(setup.setup_id, new EpsilonGreedy(arms, epsilon));
      } else if (algorithmConfig.id === 'ucb1') {
        const c = algorithmConfig.params['c'] || Math.sqrt(2);
        simulator.addAlgorithm(setup.setup_id, new UCB1(arms, c));
      } else if (algorithmConfig.id === 'thompson_sampling') {
        simulator.addAlgorithm(setup.setup_id, new ThompsonSampling(arms));
      }
    });

    // Run simulation
    const results = simulator.runSimulation(request.num_steps, request.num_runs);

    // Convert to API response format
    const response: SimulationResponse = {
      results: Object.entries(results).map(([setupId, result]) => ({
        setup_id: setupId,
        metrics: {
          steps: result.metrics.steps,
          avg_cumulative_reward: result.metrics.avg_cumulative_reward,
          stddev_cumulative_reward: result.metrics.stddev_cumulative_reward || undefined,
          avg_cumulative_regret: result.metrics.avg_cumulative_regret,
          stddev_cumulative_regret: result.metrics.stddev_cumulative_regret || undefined,
          avg_average_reward: result.metrics.avg_average_reward,
          stddev_average_reward: result.metrics.stddev_average_reward || undefined,
          avg_arm_counts: result.metrics.avg_arm_counts,
          raw_data_available: result.metrics.raw_data_available
        },
        summary: {
          total_reward: result.summary.total_reward,
          final_regret: result.summary.final_regret
        }
      }))
    };

    return response;
  }
}; 