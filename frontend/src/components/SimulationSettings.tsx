import React from 'react';

interface SimulationSettingsProps {
  settings: {
    num_steps: number;
    num_runs: number;
  };
  onSettingsChange: (settings: any) => void;
}

const SimulationSettings: React.FC<SimulationSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  
  const handleNumStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(event.target.value, 10));
    onSettingsChange({
      ...settings,
      num_steps: value
    });
  };
  
  const handleNumRunsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(event.target.value, 10));
    onSettingsChange({
      ...settings,
      num_runs: value
    });
  };
  
  return (
    <div className="simulation-settings">
      <div className="setting-item">
        <label htmlFor="num-steps">Number of Steps:</label>
        <input
          id="num-steps"
          type="number"
          min="1"
          value={settings.num_steps}
          onChange={handleNumStepsChange}
        />
        <p className="setting-help">
          How many times each algorithm will pull arms during the simulation.
        </p>
      </div>
      
      <div className="setting-item">
        <label htmlFor="num-runs">Number of Runs:</label>
        <input
          id="num-runs"
          type="number"
          min="1"
          value={settings.num_runs}
          onChange={handleNumRunsChange}
        />
        <p className="setting-help">
          How many times to repeat the simulation for averaging results.
        </p>
      </div>
    </div>
  );
};

export default SimulationSettings; 