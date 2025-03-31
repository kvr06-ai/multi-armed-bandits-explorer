// Parameter Definitions
export interface ParameterDefinition {
  id: string;
  name: string;
  type: 'float' | 'int' | 'bool';
  min?: number;
  max?: number;
  default?: any;
}

// Algorithm Definitions
export interface AlgorithmDefinition {
  id: string;
  name: string;
  params: ParameterDefinition[];
}

// Distribution Definitions
export interface DistributionDefinition {
  id: string;
  name: string;
  params: ParameterDefinition[];
}

// Simulation Request Types
export interface DistributionParams {
  [key: string]: any;
}

export interface DistributionConfig {
  id: string;
  params: DistributionParams;
}

export interface ArmConfig {
  distribution: DistributionConfig;
}

export interface BanditProblemConfig {
  arms: ArmConfig[];
}

export interface AlgorithmParams {
  [key: string]: any;
}

export interface AlgorithmConfig {
  id: string;
  params: AlgorithmParams;
}

export interface SetupConfig {
  setup_id: string;
  algorithm: AlgorithmConfig;
}

export interface SimulationRequest {
  bandit_problem: BanditProblemConfig;
  setups: SetupConfig[];
  num_steps: number;
  num_runs?: number;
}

// Simulation Response Types
export interface ArmCount {
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
  avg_arm_counts: ArmCount[];
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