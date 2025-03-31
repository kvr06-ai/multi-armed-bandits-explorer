import React from 'react';
import { Algorithm } from '../api/client';

interface AlgorithmSelectorProps {
  selectedAlgorithms: {
    setup_id: string;
    algorithm: {
      id: string;
      params: Record<string, number>;
    };
  }[];
  onSelectedAlgorithmsChange: (algorithms: any) => void;
  availableAlgorithms: Algorithm[];
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithms,
  onSelectedAlgorithmsChange,
  availableAlgorithms
}) => {
  
  const handleAddAlgorithm = () => {
    if (availableAlgorithms.length === 0) return;
    
    const defaultAlgo = availableAlgorithms[0];
    const params: Record<string, number> = {};
    
    // Set default parameters
    defaultAlgo.params.forEach(param => {
      params[param.id] = param.default;
    });
    
    onSelectedAlgorithmsChange([
      ...selectedAlgorithms,
      {
        setup_id: `Algo-${Date.now()}`,
        algorithm: {
          id: defaultAlgo.id,
          params
        }
      }
    ]);
  };
  
  const handleRemoveAlgorithm = (index: number) => {
    const newAlgorithms = [...selectedAlgorithms];
    newAlgorithms.splice(index, 1);
    onSelectedAlgorithmsChange(newAlgorithms);
  };
  
  const handleAlgorithmChange = (index: number, algorithmId: string) => {
    const newAlgorithms = [...selectedAlgorithms];
    const selectedAlgo = availableAlgorithms.find(algo => algo.id === algorithmId);
    
    if (selectedAlgo) {
      const params: Record<string, number> = {};
      
      // Set default parameters for the new algorithm
      selectedAlgo.params.forEach(param => {
        params[param.id] = param.default;
      });
      
      newAlgorithms[index] = {
        ...newAlgorithms[index],
        algorithm: {
          id: algorithmId,
          params
        }
      };
      
      onSelectedAlgorithmsChange(newAlgorithms);
    }
  };
  
  const handleParamChange = (index: number, paramId: string, value: number) => {
    const newAlgorithms = [...selectedAlgorithms];
    newAlgorithms[index] = {
      ...newAlgorithms[index],
      algorithm: {
        ...newAlgorithms[index].algorithm,
        params: {
          ...newAlgorithms[index].algorithm.params,
          [paramId]: value
        }
      }
    };
    
    onSelectedAlgorithmsChange(newAlgorithms);
  };
  
  return (
    <div className="algorithm-selector">
      {selectedAlgorithms.map((item, index) => {
        const currentAlgo = availableAlgorithms.find(algo => algo.id === item.algorithm.id);
        
        return (
          <div key={item.setup_id} className="algorithm-item">
            <div className="algorithm-header">
              <select
                value={item.algorithm.id}
                onChange={(e) => handleAlgorithmChange(index, e.target.value)}
              >
                {availableAlgorithms.map(algo => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name}
                  </option>
                ))}
              </select>
              
              {selectedAlgorithms.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAlgorithm(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
            
            {currentAlgo && currentAlgo.params.length > 0 && (
              <div className="algorithm-params">
                {currentAlgo.params.map(param => (
                  <div key={param.id} className="param-item">
                    <label htmlFor={`${item.setup_id}-${param.id}`}>
                      {param.name}:
                    </label>
                    <input
                      id={`${item.setup_id}-${param.id}`}
                      type="number"
                      min={param.min !== undefined ? param.min : undefined}
                      max={param.max !== undefined ? param.max : undefined}
                      step="0.01"
                      value={item.algorithm.params[param.id] || param.default}
                      onChange={(e) => handleParamChange(index, param.id, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      <button
        type="button"
        onClick={handleAddAlgorithm}
        className="add-button"
      >
        Add Algorithm
      </button>
    </div>
  );
};

export default AlgorithmSelector; 