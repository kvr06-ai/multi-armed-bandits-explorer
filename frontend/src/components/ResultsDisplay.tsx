import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { SimulationResult } from '../types';

interface ResultsDisplayProps {
  results: SimulationResult[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'reward' | 'regret' | 'armCounts'>('reward');
  
  if (!results || results.length === 0) {
    return <div className="no-results">No simulation results to display</div>;
  }
  
  // Get colors for each setup
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', 
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
  ];
  
  // Render cumulative reward chart
  const renderRewardChart = () => {
    // Data for plotly
    const plotData = results.map((result, index) => {
      const color = colors[index % colors.length];
      
      // With confidence intervals if we have stddev
      if (result.metrics.stddev_cumulative_reward) {
        const upperBound = result.metrics.avg_cumulative_reward.map((val, i) => 
          val + result.metrics.stddev_cumulative_reward![i]
        );
        
        const lowerBound = result.metrics.avg_cumulative_reward.map((val, i) => 
          val - result.metrics.stddev_cumulative_reward![i]
        );
        
        return [
          {
            x: result.metrics.steps,
            y: result.metrics.avg_cumulative_reward,
            type: 'scatter',
            mode: 'lines',
            name: result.setup_id,
            line: { color }
          },
          {
            x: [...result.metrics.steps, ...result.metrics.steps.slice().reverse()],
            y: [...upperBound, ...lowerBound.slice().reverse()],
            fill: 'toself',
            fillcolor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`,
            line: { color: 'transparent' },
            showlegend: false,
            hoverinfo: 'none'
          }
        ];
      } else {
        // Just the line if we don't have stddev
        return [
          {
            x: result.metrics.steps,
            y: result.metrics.avg_cumulative_reward,
            type: 'scatter',
            mode: 'lines',
            name: result.setup_id,
            line: { color }
          }
        ];
      }
    }).flat();
    
    return (
      <Plot
        data={plotData}
        layout={{
          title: 'Cumulative Reward',
          xaxis: { title: 'Steps' },
          yaxis: { title: 'Cumulative Reward' },
          hovermode: 'closest'
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };
  
  // Render cumulative regret chart
  const renderRegretChart = () => {
    // Data for plotly
    const plotData = results.map((result, index) => {
      const color = colors[index % colors.length];
      
      // With confidence intervals if we have stddev
      if (result.metrics.stddev_cumulative_regret) {
        const upperBound = result.metrics.avg_cumulative_regret.map((val, i) => 
          val + result.metrics.stddev_cumulative_regret![i]
        );
        
        const lowerBound = result.metrics.avg_cumulative_regret.map((val, i) => 
          val - result.metrics.stddev_cumulative_regret![i]
        );
        
        return [
          {
            x: result.metrics.steps,
            y: result.metrics.avg_cumulative_regret,
            type: 'scatter',
            mode: 'lines',
            name: result.setup_id,
            line: { color }
          },
          {
            x: [...result.metrics.steps, ...result.metrics.steps.slice().reverse()],
            y: [...upperBound, ...lowerBound.slice().reverse()],
            fill: 'toself',
            fillcolor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`,
            line: { color: 'transparent' },
            showlegend: false,
            hoverinfo: 'none'
          }
        ];
      } else {
        // Just the line if we don't have stddev
        return [
          {
            x: result.metrics.steps,
            y: result.metrics.avg_cumulative_regret,
            type: 'scatter',
            mode: 'lines',
            name: result.setup_id,
            line: { color }
          }
        ];
      }
    }).flat();
    
    return (
      <Plot
        data={plotData}
        layout={{
          title: 'Cumulative Regret',
          xaxis: { title: 'Steps' },
          yaxis: { title: 'Cumulative Regret' },
          hovermode: 'closest'
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };
  
  // Render arm counts chart
  const renderArmCountsChart = () => {
    // Group arm counts by algorithm setup
    const plotData = results.map((result, index) => {
      const color = colors[index % colors.length];
      
      return {
        x: result.metrics.avg_arm_counts.map(arm => `Arm ${arm.arm_index + 1}`),
        y: result.metrics.avg_arm_counts.map(arm => arm.count),
        type: 'bar',
        name: result.setup_id,
        marker: { color }
      };
    });
    
    return (
      <Plot
        data={plotData}
        layout={{
          title: 'Arm Selection Counts',
          xaxis: { title: 'Arm' },
          yaxis: { title: 'Times Selected' },
          barmode: 'group'
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };
  
  // Render the summary table
  const renderSummaryTable = () => {
    return (
      <div className="summary-table">
        <h3>Simulation Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Setup</th>
              <th>Total Reward</th>
              <th>Final Regret</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => (
              <tr key={result.setup_id}>
                <td>{result.setup_id}</td>
                <td>{result.summary.total_reward.toFixed(2)}</td>
                <td>{result.summary.final_regret.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="results-display">
      <h2>Simulation Results</h2>
      
      <div className="tab-buttons">
        <button
          className={activeTab === 'reward' ? 'active' : ''}
          onClick={() => setActiveTab('reward')}
        >
          Cumulative Reward
        </button>
        <button
          className={activeTab === 'regret' ? 'active' : ''}
          onClick={() => setActiveTab('regret')}
        >
          Cumulative Regret
        </button>
        <button
          className={activeTab === 'armCounts' ? 'active' : ''}
          onClick={() => setActiveTab('armCounts')}
        >
          Arm Selection Counts
        </button>
      </div>
      
      <div className="chart-container">
        {activeTab === 'reward' && renderRewardChart()}
        {activeTab === 'regret' && renderRegretChart()}
        {activeTab === 'armCounts' && renderArmCountsChart()}
      </div>
      
      {renderSummaryTable()}
    </div>
  );
};

export default ResultsDisplay; 