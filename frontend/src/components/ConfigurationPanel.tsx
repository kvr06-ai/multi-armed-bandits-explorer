import { useState, useEffect } from 'react';
import { 
  AlgorithmDefinition, 
  DistributionDefinition,
  SetupConfig,
  ArmConfig,
  SimulationRequest
} from '../types';
import { getAlgorithms, getDistributions } from '../api/client';
import AlgorithmSelector from './AlgorithmSelector';
import BanditProblemConfig from './BanditProblemConfig';
import SimulationSettings from './SimulationSettings';

interface ConfigurationPanelProps {
  onRunSimulation: (request: SimulationRequest) => void;
  isLoading: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  onRunSimulation,
  isLoading
}) => {
  // State for available algorithms and distributions
  const [algorithms, setAlgorithms] = useState<AlgorithmDefinition[]>([]);
  const [distributions, setDistributions] = useState<DistributionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for configuration
  const [setups, setSetups] = useState<SetupConfig[]>([]);
  const [arms, setArms] = useState<ArmConfig[]>([]);
  const [numSteps, setNumSteps] = useState(1000);
  const [numRuns, setNumRuns] = useState(1);
  
  // Fetch algorithms and distributions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [algorithmsData, distributionsData] = await Promise.all([
          getAlgorithms(),
          getDistributions()
        ]);
        
        setAlgorithms(algorithmsData);
        setDistributions(distributionsData);
        
        // Initialize default setup
        if (algorithmsData.length > 0) {
          const defaultAlgorithm = algorithmsData[0];
          const defaultParams: Record<string, any> = {};
          
          // Set default values for algorithm parameters
          defaultAlgorithm.params.forEach(param => {
            defaultParams[param.id] = param.default;
          });
          
          setSetups([{
            setup_id: `setup-${Date.now()}`,
            algorithm: {
              id: defaultAlgorithm.id,
              params: defaultParams
            }
          }]);
        }
        
        // Initialize default arms
        if (distributionsData.length > 0) {
          const defaultDistribution = distributionsData[0];
          const defaultParams: Record<string, any> = {};
          
          // Set default values for distribution parameters
          defaultDistribution.params.forEach(param => {
            defaultParams[param.id] = param.default;
          });
          
          // Create two arms by default
          setArms([
            {
              distribution: {
                id: defaultDistribution.id,
                params: { ...defaultParams }
              }
            },
            {
              distribution: {
                id: defaultDistribution.id,
                params: { ...defaultParams }
              }
            }
          ]);
        }
        
      } catch (err) {
        setError("Failed to load configuration data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle adding a new algorithm setup
  const handleAddSetup = () => {
    if (algorithms.length === 0) return;
    
    const defaultAlgorithm = algorithms[0];
    const defaultParams: Record<string, any> = {};
    
    defaultAlgorithm.params.forEach(param => {
      defaultParams[param.id] = param.default;
    });
    
    const newSetup: SetupConfig = {
      setup_id: `setup-${Date.now()}`,
      algorithm: {
        id: defaultAlgorithm.id,
        params: defaultParams
      }
    };
    
    setSetups([...setups, newSetup]);
  };
  
  // Handle removing a setup
  const handleRemoveSetup = (setupId: string) => {
    setSetups(setups.filter(setup => setup.setup_id !== setupId));
  };
  
  // Handle updating a setup
  const handleUpdateSetup = (updatedSetup: SetupConfig) => {
    setSetups(setups.map(setup => 
      setup.setup_id === updatedSetup.setup_id ? updatedSetup : setup
    ));
  };
  
  // Handle updating arms configuration
  const handleUpdateArms = (updatedArms: ArmConfig[]) => {
    setArms(updatedArms);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate we have at least one setup and two arms
    if (setups.length === 0) {
      setError("At least one algorithm setup is required");
      return;
    }
    
    if (arms.length < 2) {
      setError("At least two arms are required");
      return;
    }
    
    // Create simulation request
    const request: SimulationRequest = {
      bandit_problem: {
        arms: arms
      },
      setups: setups,
      num_steps: numSteps,
      num_runs: numRuns
    };
    
    // Send the request to parent component
    onRunSimulation(request);
  };
  
  if (loading) return <div>Loading configuration...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <form onSubmit={handleSubmit} className="configuration-panel">
      <h2>Simulation Configuration</h2>
      
      <div className="section">
        <h3>Bandit Problem Setup</h3>
        <BanditProblemConfig 
          arms={arms}
          distributions={distributions}
          onUpdateArms={handleUpdateArms}
        />
      </div>
      
      <div className="section">
        <h3>Algorithm Setups</h3>
        {setups.map((setup, index) => (
          <div key={setup.setup_id} className="setup-card">
            <div className="setup-header">
              <h4>Setup {index + 1}</h4>
              {setups.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveSetup(setup.setup_id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
            <AlgorithmSelector
              algorithms={algorithms}
              setup={setup}
              onUpdateSetup={handleUpdateSetup}
            />
          </div>
        ))}
        <button 
          type="button" 
          onClick={handleAddSetup}
          className="add-setup-btn"
        >
          Add Algorithm Setup
        </button>
      </div>
      
      <div className="section">
        <h3>Simulation Settings</h3>
        <SimulationSettings
          numSteps={numSteps}
          numRuns={numRuns}
          onUpdateNumSteps={setNumSteps}
          onUpdateNumRuns={setNumRuns}
        />
      </div>
      
      <div className="controls">
        <button 
          type="submit" 
          className="run-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>
    </form>
  );
};

export default ConfigurationPanel; 