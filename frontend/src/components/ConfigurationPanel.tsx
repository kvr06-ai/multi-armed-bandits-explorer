import { useState } from 'react';
import AlgorithmSelector from './AlgorithmSelector';
import BanditProblemConfig from './BanditProblemConfig';
import SimulationSettings from './SimulationSettings';
import { Algorithm, Distribution, SimulationRequest } from '../api/client';

interface ConfigurationPanelProps {
  algorithms: Algorithm[];
  distributions: Distribution[];
  onRunSimulation: (request: SimulationRequest) => Promise<void>;
  loading: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  algorithms, 
  distributions, 
  onRunSimulation, 
  loading 
}) => {
  const [banditProblem, setBanditProblem] = useState({
    arms: [
      { 
        distribution: { 
          id: 'bernoulli', 
          params: { p: 0.3 } 
        } 
      },
      { 
        distribution: { 
          id: 'bernoulli', 
          params: { p: 0.5 } 
        } 
      },
      { 
        distribution: { 
          id: 'bernoulli', 
          params: { p: 0.7 } 
        } 
      }
    ]
  });
  
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([
    { 
      setup_id: 'EpsilonGreedy', 
      algorithm: { 
        id: 'epsilon_greedy', 
        params: { epsilon: 0.1 } 
      } 
    }
  ]);
  
  const [simSettings, setSimSettings] = useState({
    num_steps: 1000,
    num_runs: 1
  });
  
  const handleRunSimulation = () => {
    const request: SimulationRequest = {
      bandit_problem: banditProblem,
      setups: selectedAlgorithms,
      num_steps: simSettings.num_steps,
      num_runs: simSettings.num_runs
    };
    
    onRunSimulation(request);
  };
  
  return (
    <div className="configuration-panel">
      <h2>Configuration</h2>
      
      <div className="config-section">
        <h3>Bandit Problem Setup</h3>
        <BanditProblemConfig 
          banditProblem={banditProblem}
          onBanditProblemChange={setBanditProblem}
          availableDistributions={distributions}
        />
      </div>
      
      <div className="config-section">
        <h3>Algorithm Selection</h3>
        <AlgorithmSelector 
          selectedAlgorithms={selectedAlgorithms}
          onSelectedAlgorithmsChange={setSelectedAlgorithms}
          availableAlgorithms={algorithms}
        />
      </div>
      
      <div className="config-section">
        <h3>Simulation Settings</h3>
        <SimulationSettings 
          settings={simSettings}
          onSettingsChange={setSimSettings}
        />
      </div>
      
      <div className="run-section">
        <button 
          onClick={handleRunSimulation} 
          disabled={loading}
          className="run-button"
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
};

export default ConfigurationPanel; 