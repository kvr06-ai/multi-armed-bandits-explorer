import React from 'react';
import { Distribution } from '../api/client';

interface BanditProblemConfigProps {
  banditProblem: {
    arms: {
      distribution: {
        id: string;
        params: Record<string, number>;
      };
    }[];
  };
  onBanditProblemChange: (problem: any) => void;
  availableDistributions: Distribution[];
}

const BanditProblemConfig: React.FC<BanditProblemConfigProps> = ({
  banditProblem,
  onBanditProblemChange,
  availableDistributions
}) => {
  
  const handleAddArm = () => {
    if (availableDistributions.length === 0) return;
    
    const defaultDist = availableDistributions[0];
    const params: Record<string, number> = {};
    
    // Set default parameters
    defaultDist.params.forEach(param => {
      params[param.id] = param.default;
    });
    
    onBanditProblemChange({
      ...banditProblem,
      arms: [
        ...banditProblem.arms,
        {
          distribution: {
            id: defaultDist.id,
            params
          }
        }
      ]
    });
  };
  
  const handleRemoveArm = (index: number) => {
    const newArms = [...banditProblem.arms];
    newArms.splice(index, 1);
    onBanditProblemChange({
      ...banditProblem,
      arms: newArms
    });
  };
  
  const handleDistributionChange = (index: number, distId: string) => {
    const newArms = [...banditProblem.arms];
    const selectedDist = availableDistributions.find(dist => dist.id === distId);
    
    if (selectedDist) {
      const params: Record<string, number> = {};
      
      // Set default parameters for the new distribution
      selectedDist.params.forEach(param => {
        params[param.id] = param.default;
      });
      
      newArms[index] = {
        ...newArms[index],
        distribution: {
          id: distId,
          params
        }
      };
      
      onBanditProblemChange({
        ...banditProblem,
        arms: newArms
      });
    }
  };
  
  const handleParamChange = (armIndex: number, paramId: string, value: number) => {
    const newArms = [...banditProblem.arms];
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
    
    onBanditProblemChange({
      ...banditProblem,
      arms: newArms
    });
  };
  
  return (
    <div className="bandit-problem-config">
      <div className="arms-container">
        {banditProblem.arms.map((arm, index) => {
          const currentDist = availableDistributions.find(dist => dist.id === arm.distribution.id);
          
          return (
            <div key={index} className="arm-item">
              <div className="arm-header">
                <h4>Arm {index + 1}</h4>
                {banditProblem.arms.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArm(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="distribution-selector">
                <label htmlFor={`arm-${index}-dist`}>Distribution:</label>
                <select
                  id={`arm-${index}-dist`}
                  value={arm.distribution.id}
                  onChange={(e) => handleDistributionChange(index, e.target.value)}
                >
                  {availableDistributions.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {currentDist && (
                <div className="distribution-params">
                  {currentDist.params.map(param => (
                    <div key={param.id} className="param-item">
                      <label htmlFor={`arm-${index}-param-${param.id}`}>
                        {param.name}:
                      </label>
                      <input
                        id={`arm-${index}-param-${param.id}`}
                        type="number"
                        min={param.min !== undefined ? param.min : undefined}
                        max={param.max !== undefined ? param.max : undefined}
                        step="0.01"
                        value={arm.distribution.params[param.id] || param.default}
                        onChange={(e) => handleParamChange(index, param.id, parseFloat(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button
        type="button"
        onClick={handleAddArm}
        className="add-button"
      >
        Add Arm
      </button>
    </div>
  );
};

export default BanditProblemConfig; 