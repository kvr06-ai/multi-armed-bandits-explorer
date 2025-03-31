import React from 'react';
import { ArmConfig, DistributionDefinition, DistributionParams } from '../types';

interface BanditProblemConfigProps {
  arms: ArmConfig[];
  distributions: DistributionDefinition[];
  onUpdateArms: (arms: ArmConfig[]) => void;
}

const BanditProblemConfig: React.FC<BanditProblemConfigProps> = ({
  arms,
  distributions,
  onUpdateArms
}) => {
  // Handle adding a new arm
  const handleAddArm = () => {
    if (distributions.length === 0) return;
    
    const defaultDistribution = distributions[0];
    const defaultParams: DistributionParams = {};
    
    // Set default values for distribution parameters
    defaultDistribution.params.forEach(param => {
      defaultParams[param.id] = param.default;
    });
    
    // Add a new arm with default distribution
    onUpdateArms([
      ...arms,
      {
        distribution: {
          id: defaultDistribution.id,
          params: defaultParams
        }
      }
    ]);
  };
  
  // Handle removing an arm
  const handleRemoveArm = (index: number) => {
    if (arms.length <= 2) {
      alert("A bandit problem must have at least 2 arms");
      return;
    }
    
    const newArms = [...arms];
    newArms.splice(index, 1);
    onUpdateArms(newArms);
  };
  
  // Handle changing an arm's distribution type
  const handleDistributionChange = (index: number, distributionId: string) => {
    const distribution = distributions.find(dist => dist.id === distributionId);
    
    if (!distribution) return;
    
    // Initialize parameters with default values
    const params: DistributionParams = {};
    distribution.params.forEach(param => {
      params[param.id] = param.default;
    });
    
    // Update the specified arm
    const newArms = [...arms];
    newArms[index] = {
      distribution: {
        id: distributionId,
        params
      }
    };
    
    onUpdateArms(newArms);
  };
  
  // Handle changing an arm's distribution parameter
  const handleParamChange = (armIndex: number, paramId: string, value: any) => {
    const newArms = [...arms];
    
    // Update the parameter value
    newArms[armIndex] = {
      ...newArms[armIndex],
      distribution: {
        ...newArms[armIndex].distribution,
        params: {
          ...newArms[armIndex].distribution.params,
          [paramId]: value
        }
      }
    };
    
    onUpdateArms(newArms);
  };
  
  return (
    <div className="bandit-problem-config">
      <div className="arms-list">
        {arms.map((arm, index) => {
          // Find distribution definition for this arm
          const distributionDef = distributions.find(
            dist => dist.id === arm.distribution.id
          );
          
          return (
            <div key={index} className="arm-config">
              <div className="arm-header">
                <h4>Arm {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveArm(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
              
              <div className="form-group">
                <label>Distribution:</label>
                <select
                  value={arm.distribution.id}
                  onChange={(e) => handleDistributionChange(index, e.target.value)}
                >
                  {distributions.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {distributionDef && distributionDef.params.map(param => (
                <div key={param.id} className="form-group">
                  <label>{param.name}:</label>
                  {param.type === 'float' || param.type === 'int' ? (
                    <input
                      type="number"
                      step={param.type === 'float' ? 'any' : 1}
                      min={param.min}
                      max={param.max}
                      value={arm.distribution.params[param.id] ?? param.default}
                      onChange={(e) => {
                        const newValue = param.type === 'int'
                          ? parseInt(e.target.value, 10)
                          : parseFloat(e.target.value);
                        handleParamChange(index, param.id, newValue);
                      }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={arm.distribution.params[param.id] ?? param.default}
                      onChange={(e) => handleParamChange(index, param.id, e.target.checked)}
                    />
                  )}
                  
                  {param.min !== undefined && param.max !== undefined && (
                    <span className="param-range">
                      Range: {param.min} - {param.max}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      
      <button
        type="button"
        onClick={handleAddArm}
        className="add-arm-btn"
      >
        Add Arm
      </button>
    </div>
  );
};

export default BanditProblemConfig; 