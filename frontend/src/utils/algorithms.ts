/**
 * Multi-Armed Bandit Algorithms Implementation
 */

interface BanditArm {
  pull(): number;
  getMean(): number;
}

// Bernoulli Distribution
export class BernoulliArm implements BanditArm {
  private p: number;
  
  constructor(p: number) {
    this.p = p;
  }
  
  pull(): number {
    return Math.random() < this.p ? 1 : 0;
  }
  
  getMean(): number {
    return this.p;
  }
}

// Gaussian Distribution
export class GaussianArm implements BanditArm {
  private mean: number;
  private stddev: number;
  
  constructor(mean: number, stddev: number) {
    this.mean = mean;
    this.stddev = stddev;
  }
  
  pull(): number {
    // Box-Muller transform for Gaussian random number
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return this.mean + this.stddev * z0;
  }
  
  getMean(): number {
    return this.mean;
  }
}

// Algorithm base class
abstract class BanditAlgorithm {
  protected arms: BanditArm[];
  protected counts: number[];
  protected values: number[];
  protected t: number;
  
  constructor(arms: BanditArm[]) {
    this.arms = arms;
    this.counts = Array(arms.length).fill(0);
    this.values = Array(arms.length).fill(0);
    this.t = 0;
  }
  
  reset(): void {
    this.counts = Array(this.arms.length).fill(0);
    this.values = Array(this.arms.length).fill(0);
    this.t = 0;
  }
  
  update(armIndex: number, reward: number): void {
    this.counts[armIndex]++;
    // Incremental average update
    const n = this.counts[armIndex];
    const value = this.values[armIndex];
    this.values[armIndex] = ((n - 1) / n) * value + (1 / n) * reward;
    this.t++;
  }
  
  abstract select(): number;
}

// Epsilon-Greedy Algorithm
export class EpsilonGreedy extends BanditAlgorithm {
  private epsilon: number;
  
  constructor(arms: BanditArm[], epsilon: number = 0.1) {
    super(arms);
    this.epsilon = epsilon;
  }
  
  select(): number {
    // Exploration
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.arms.length);
    }
    
    // Exploitation (find best arm)
    let bestArm = 0;
    let bestValue = this.values[0];
    
    for (let i = 1; i < this.values.length; i++) {
      if (this.values[i] > bestValue) {
        bestValue = this.values[i];
        bestArm = i;
      }
    }
    
    return bestArm;
  }
}

// UCB1 Algorithm
export class UCB1 extends BanditAlgorithm {
  private c: number;
  
  constructor(arms: BanditArm[], c: number = Math.sqrt(2)) {
    super(arms);
    this.c = c;
  }
  
  select(): number {
    // Initialize arms that haven't been pulled
    for (let i = 0; i < this.arms.length; i++) {
      if (this.counts[i] === 0) {
        return i;
      }
    }
    
    // Calculate UCB values
    let ucbValues = this.values.map((value, i) => {
      const exploration = this.c * Math.sqrt(Math.log(this.t) / this.counts[i]);
      return value + exploration;
    });
    
    // Find best arm based on UCB value
    let bestArm = 0;
    let bestValue = ucbValues[0];
    
    for (let i = 1; i < ucbValues.length; i++) {
      if (ucbValues[i] > bestValue) {
        bestValue = ucbValues[i];
        bestArm = i;
      }
    }
    
    return bestArm;
  }
}

// Thompson Sampling Algorithm
export class ThompsonSampling extends BanditAlgorithm {
  private successes: number[];
  private failures: number[];
  
  constructor(arms: BanditArm[]) {
    super(arms);
    this.successes = Array(arms.length).fill(1); // Beta prior alpha=1
    this.failures = Array(arms.length).fill(1);  // Beta prior beta=1
  }
  
  // Sample from beta distribution
  private sampleBeta(alpha: number, beta: number): number {
    // Using gamma distribution to sample from beta
    // Beta(a,b) = Gamma(a,1) / (Gamma(a,1) + Gamma(b,1))
    const sampleGamma = (k: number): number => {
      // Simple gamma sampling for integer k
      let res = -Math.log(Math.random());
      for (let i = 1; i < k; i++) {
        res -= Math.log(Math.random());
      }
      return res;
    };
    
    const x = sampleGamma(alpha);
    const y = sampleGamma(beta);
    
    return x / (x + y);
  }
  
  select(): number {
    // Sample from beta distribution for each arm
    const samples = this.successes.map((s, i) => 
      this.sampleBeta(s, this.failures[i])
    );
    
    // Select arm with highest sample
    let bestArm = 0;
    let bestValue = samples[0];
    
    for (let i = 1; i < samples.length; i++) {
      if (samples[i] > bestValue) {
        bestValue = samples[i];
        bestArm = i;
      }
    }
    
    return bestArm;
  }
  
  // Override update for Thompson Sampling to track successes/failures
  update(armIndex: number, reward: number): void {
    this.counts[armIndex]++;
    
    // For Bernoulli rewards
    if (reward === 1) {
      this.successes[armIndex]++;
    } else {
      this.failures[armIndex]++;
    }
    
    // Update value estimate
    this.values[armIndex] = this.successes[armIndex] / 
      (this.successes[armIndex] + this.failures[armIndex]);
      
    this.t++;
  }
}

// Simulator
export class BanditSimulator {
  private arms: BanditArm[];
  private algorithms: { [key: string]: BanditAlgorithm };
  
  constructor(arms: BanditArm[]) {
    this.arms = arms;
    this.algorithms = {};
  }
  
  addAlgorithm(name: string, algorithm: BanditAlgorithm): void {
    this.algorithms[name] = algorithm;
  }
  
  runSimulation(numSteps: number, numRuns: number = 1): SimulationResults {
    const results: SimulationResults = {};
    
    for (const [name, algorithm] of Object.entries(this.algorithms)) {
      results[name] = this.runAlgorithm(algorithm, numSteps, numRuns);
    }
    
    return results;
  }
  
  private runAlgorithm(algorithm: BanditAlgorithm, numSteps: number, numRuns: number): AlgorithmResult {
    // Arrays to store results across runs
    const cumulativeRewards: number[][] = Array(numRuns).fill(0).map(() => Array(numSteps).fill(0));
    const cumulativeRegrets: number[][] = Array(numRuns).fill(0).map(() => Array(numSteps).fill(0));
    const averageRewards: number[][] = Array(numRuns).fill(0).map(() => Array(numSteps).fill(0));
    const armCounts: number[][] = Array(numRuns).fill(0).map(() => Array(this.arms.length).fill(0));
    
    // Get optimal arm
    let optimalArm = 0;
    let optimalMean = this.arms[0].getMean();
    
    for (let i = 1; i < this.arms.length; i++) {
      const mean = this.arms[i].getMean();
      if (mean > optimalMean) {
        optimalMean = mean;
        optimalArm = i;
      }
    }
    
    // Run simulations
    for (let run = 0; run < numRuns; run++) {
      algorithm.reset();
      let totalReward = 0;
      
      for (let step = 0; step < numSteps; step++) {
        // Select arm
        const armIndex = algorithm.select();
        
        // Pull the arm and get reward
        const reward = this.arms[armIndex].pull();
        
        // Update algorithm
        algorithm.update(armIndex, reward);
        
        // Update metrics
        totalReward += reward;
        cumulativeRewards[run][step] = totalReward;
        averageRewards[run][step] = totalReward / (step + 1);
        
        // Calculate regret (difference between optimal arm mean and selected arm mean)
        const instantRegret = optimalMean - this.arms[armIndex].getMean();
        if (step === 0) {
          cumulativeRegrets[run][step] = instantRegret;
        } else {
          cumulativeRegrets[run][step] = cumulativeRegrets[run][step - 1] + instantRegret;
        }
        
        // Update arm counts
        armCounts[run][armIndex]++;
      }
    }
    
    // Calculate averages across runs
    const steps = Array.from({ length: numSteps }, (_, i) => i);
    const avgCumulativeReward = steps.map((step) => {
      let sum = 0;
      for (let run = 0; run < numRuns; run++) {
        sum += cumulativeRewards[run][step];
      }
      return sum / numRuns;
    });
    
    const avgCumulativeRegret = steps.map((step) => {
      let sum = 0;
      for (let run = 0; run < numRuns; run++) {
        sum += cumulativeRegrets[run][step];
      }
      return sum / numRuns;
    });
    
    const avgAverageReward = steps.map((step) => {
      let sum = 0;
      for (let run = 0; run < numRuns; run++) {
        sum += averageRewards[run][step];
      }
      return sum / numRuns;
    });
    
    const avgArmCounts = this.arms.map((_, arm) => {
      let sum = 0;
      for (let run = 0; run < numRuns; run++) {
        sum += armCounts[run][arm];
      }
      return {
        arm_index: arm,
        count: sum / numRuns
      };
    });
    
    // Calculate standard deviations if multiple runs
    let stddevCumulativeReward = null;
    let stddevCumulativeRegret = null;
    let stddevAverageReward = null;
    
    if (numRuns > 1) {
      stddevCumulativeReward = steps.map((step) => {
        let sumSquaredDiff = 0;
        for (let run = 0; run < numRuns; run++) {
          const diff = cumulativeRewards[run][step] - avgCumulativeReward[step];
          sumSquaredDiff += diff * diff;
        }
        return Math.sqrt(sumSquaredDiff / numRuns);
      });
      
      stddevCumulativeRegret = steps.map((step) => {
        let sumSquaredDiff = 0;
        for (let run = 0; run < numRuns; run++) {
          const diff = cumulativeRegrets[run][step] - avgCumulativeRegret[step];
          sumSquaredDiff += diff * diff;
        }
        return Math.sqrt(sumSquaredDiff / numRuns);
      });
      
      stddevAverageReward = steps.map((step) => {
        let sumSquaredDiff = 0;
        for (let run = 0; run < numRuns; run++) {
          const diff = averageRewards[run][step] - avgAverageReward[step];
          sumSquaredDiff += diff * diff;
        }
        return Math.sqrt(sumSquaredDiff / numRuns);
      });
    }
    
    return {
      metrics: {
        steps,
        avg_cumulative_reward: avgCumulativeReward,
        stddev_cumulative_reward: stddevCumulativeReward,
        avg_cumulative_regret: avgCumulativeRegret,
        stddev_cumulative_regret: stddevCumulativeRegret,
        avg_average_reward: avgAverageReward,
        stddev_average_reward: stddevAverageReward,
        avg_arm_counts: avgArmCounts,
        raw_data_available: true
      },
      summary: {
        total_reward: avgCumulativeReward[numSteps - 1],
        final_regret: avgCumulativeRegret[numSteps - 1]
      }
    };
  }
}

// Types for simulation results
export interface ArmCount {
  arm_index: number;
  count: number;
}

export interface SimulationMetrics {
  steps: number[];
  avg_cumulative_reward: number[];
  stddev_cumulative_reward: number[] | null;
  avg_cumulative_regret: number[];
  stddev_cumulative_regret: number[] | null;
  avg_average_reward: number[];
  stddev_average_reward: number[] | null;
  avg_arm_counts: ArmCount[];
  raw_data_available: boolean;
}

export interface SimulationSummary {
  total_reward: number;
  final_regret: number;
}

export interface AlgorithmResult {
  metrics: SimulationMetrics;
  summary: SimulationSummary;
}

export interface SimulationResults {
  [algorithmName: string]: AlgorithmResult;
} 