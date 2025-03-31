import React from 'react';
import { SimulationResult } from '../types';

interface ResultsInterpretationProps {
  results: SimulationResult[];
}

const ResultsInterpretation: React.FC<ResultsInterpretationProps> = ({ results }) => {
  if (!results || results.length === 0) {
    return null;
  }

  // Find the best algorithm based on highest total reward
  const bestAlgorithm = [...results].sort((a, b) => 
    b.summary.total_reward - a.summary.total_reward
  )[0];

  // Find the algorithm with lowest regret
  const lowestRegretAlgorithm = [...results].sort((a, b) => 
    a.summary.final_regret - b.summary.final_regret
  )[0];

  // Calculate average rewards per step for each algorithm
  const avgRewardsPerStep = results.map(result => ({
    setupId: result.setup_id,
    avgReward: result.summary.total_reward / result.metrics.steps.length
  }));

  // Check if there's a clear winner (significantly better than others)
  const hasSignificantWinner = results.length > 1 && 
    (bestAlgorithm.summary.total_reward > 
      results.filter(r => r.setup_id !== bestAlgorithm.setup_id)
            .reduce((max, r) => Math.max(max, r.summary.total_reward), 0) * 1.1);

  // Calculate exploration vs exploitation patterns
  const explorationPatterns = results.map(result => {
    // Count how many different arms were significantly tried
    const significantlyTriedArms = result.metrics.avg_arm_counts.filter(
      arm => arm.count > result.metrics.steps.length * 0.05
    ).length;
    
    const totalArms = result.metrics.avg_arm_counts.length;
    const explorationRatio = significantlyTriedArms / totalArms;
    
    return {
      setupId: result.setup_id,
      explorationRatio,
      classification: explorationRatio < 0.3 ? 'Heavy exploitation' : 
                      explorationRatio < 0.7 ? 'Balanced' : 'Heavy exploration'
    };
  });

  return (
    <div className="results-interpretation">
      <h2>Interpretation</h2>
      
      <div className="interpretation-section">
        <h3>Overall Performance</h3>
        {results.length > 1 ? (
          <>
            <p>
              <strong>{bestAlgorithm.setup_id}</strong> achieved the highest total reward of {bestAlgorithm.summary.total_reward.toFixed(2)}, 
              making it the most effective algorithm in this simulation.
            </p>
            {hasSignificantWinner && (
              <p>
                This algorithm significantly outperformed the others, suggesting it's especially 
                well-suited for this type of bandit problem.
              </p>
            )}
            <p>
              <strong>{lowestRegretAlgorithm.setup_id}</strong> had the lowest regret ({lowestRegretAlgorithm.summary.final_regret.toFixed(2)}), 
              meaning it was most efficient at finding and exploiting the best arm.
            </p>
          </>
        ) : (
          <p>
            <strong>{results[0].setup_id}</strong> achieved a total reward of {results[0].summary.total_reward.toFixed(2)} 
            with a final regret of {results[0].summary.final_regret.toFixed(2)}.
          </p>
        )}
      </div>
      
      <div className="interpretation-section">
        <h3>Exploration vs. Exploitation</h3>
        {explorationPatterns.map(pattern => (
          <p key={pattern.setupId}>
            <strong>{pattern.setupId}</strong>: {pattern.classification} 
            ({(pattern.explorationRatio * 100).toFixed(1)}% of arms explored significantly).
            {pattern.classification === 'Heavy exploitation' && 
              ' This algorithm quickly focused on what it thought were the best arms.'}
            {pattern.classification === 'Balanced' && 
              ' This algorithm maintained a good balance between trying new arms and exploiting good ones.'}
            {pattern.classification === 'Heavy exploration' && 
              ' This algorithm spent more time exploring different arms rather than exploiting the best ones.'}
          </p>
        ))}
      </div>
      
      <div className="interpretation-section">
        <h3>Learning Speed</h3>
        {results.map(result => {
          // Calculate how quickly the algorithm converged on good arms
          // by looking at when regret growth slowed down
          const regretValues = result.metrics.avg_cumulative_regret;
          const midPoint = Math.floor(regretValues.length / 2);
          const firstHalfGrowth = regretValues[midPoint] - regretValues[0];
          const secondHalfGrowth = regretValues[regretValues.length - 1] - regretValues[midPoint];
          const learningSpeed = firstHalfGrowth > secondHalfGrowth * 1.5 ? 'Fast' : 
                               firstHalfGrowth > secondHalfGrowth * 1.1 ? 'Moderate' : 'Slow';
          
          return (
            <p key={result.setup_id}>
              <strong>{result.setup_id}</strong>: {learningSpeed} learning speed. 
              {learningSpeed === 'Fast' && 
                ' This algorithm quickly identified the better arms and stopped accumulating much regret.'}
              {learningSpeed === 'Moderate' && 
                ' This algorithm had a moderate learning curve, gradually improving its arm selection.'}
              {learningSpeed === 'Slow' && 
                ' This algorithm continued exploring throughout the simulation, accumulating regret at a steady rate.'}
            </p>
          );
        })}
      </div>
      
      <div className="interpretation-section">
        <h3>Recommendations</h3>
        {results.length > 1 ? (
          <>
            <p>
              <strong>For this specific problem:</strong> {bestAlgorithm.setup_id} appears to be the best choice based on 
              total reward, while {lowestRegretAlgorithm.setup_id} minimized regret most effectively.
            </p>
            <p>
              <strong>For similar problems with limited trials:</strong> Consider using 
              {explorationPatterns.filter(p => p.classification === 'Balanced' || p.classification === 'Heavy exploitation')
                .map(p => ` ${p.setupId}`).join(' or')}
              as they tend to converge more quickly.
            </p>
          </>
        ) : (
          <p>
            To gain deeper insights, try running multiple algorithms on the same problem and 
            compare their performance across different metrics.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultsInterpretation; 