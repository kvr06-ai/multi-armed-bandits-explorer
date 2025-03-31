import React from 'react';

interface SimulationSettingsProps {
  numSteps: number;
  numRuns: number;
  onUpdateNumSteps: (steps: number) => void;
  onUpdateNumRuns: (runs: number) => void;
}

const SimulationSettings: React.FC<SimulationSettingsProps> = ({
  numSteps,
  numRuns,
  onUpdateNumSteps,
  onUpdateNumRuns
}) => {
  return (
    <div className="simulation-settings">
      <div className="form-group">
        <label>Number of Steps:</label>
        <input
          type="number"
          min={10}
          max={10000}
          value={numSteps}
          onChange={(e) => onUpdateNumSteps(parseInt(e.target.value, 10))}
        />
        <span className="setting-description">
          Number of arm pulls per simulation run
        </span>
      </div>
      
      <div className="form-group">
        <label>Number of Runs:</label>
        <input
          type="number"
          min={1}
          max={100}
          value={numRuns}
          onChange={(e) => onUpdateNumRuns(parseInt(e.target.value, 10))}
        />
        <span className="setting-description">
          Number of independent simulation runs to average results over
        </span>
      </div>
    </div>
  );
};

export default SimulationSettings; 