import React, { useState, useEffect } from 'react';
import { AlgorithmDefinition, SetupConfig, ParameterDefinition } from '../types';

interface AlgorithmSelectorProps {
  algorithms: AlgorithmDefinition[];
  setup: SetupConfig;
  onUpdateSetup: (updatedSetup: SetupConfig) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  setup,
  onUpdateSetup
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmDefinition | null>(null);
  
  // Find the selected algorithm from the list when setup changes
  useEffect(() => {
    const algorithm = algorithms.find(alg => alg.id === setup.algorithm.id) || null;
    setSelectedAlgorithm(algorithm);
  }, [algorithms, setup.algorithm.id]);
  
  // Handle algorithm change
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const algorithmId = e.target.value;
    const algorithm = algorithms.find(alg => alg.id === algorithmId);
    
    if (algorithm) {
      // Initialize parameters with default values
      const params: Record<string, any> = {};
      algorithm.params.forEach(param => {
        params[param.id] = param.default;
      });
      
      // Update setup
      onUpdateSetup({
        ...setup,
        algorithm: {
          id: algorithmId,
          params
        }
      });
    }
  };
  
  // Handle parameter change
  const handleParamChange = (paramId: string, value: any) => {
    onUpdateSetup({
      ...setup,
      algorithm: {
        ...setup.algorithm,
        params: {
          ...setup.algorithm.params,
          [paramId]: value
        }
      }
    });
  };
  
  // Render parameter input based on parameter type
  const renderParameterInput = (param: ParameterDefinition) => {
    const value = setup.algorithm.params[param.id] ?? param.default;
    
    switch (param.type) {
      case 'float':
      case 'int':
        return (
          <input
            type="number"
            step={param.type === 'float' ? 'any' : 1}
            min={param.min}
            max={param.max}
            value={value}
            onChange={(e) => {
              const newValue = param.type === 'int' 
                ? parseInt(e.target.value, 10) 
                : parseFloat(e.target.value);
              handleParamChange(param.id, newValue);
            }}
          />
        );
      
      case 'bool':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParamChange(param.id, e.target.checked)}
          />
        );
      
      default:
        return <input type="text" value={value} readOnly />;
    }
  };
  
  return (
    <div className="algorithm-selector">
      <div className="form-group">
        <label>Algorithm:</label>
        <select 
          value={setup.algorithm.id} 
          onChange={handleAlgorithmChange}
        >
          {algorithms.map(algorithm => (
            <option key={algorithm.id} value={algorithm.id}>
              {algorithm.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedAlgorithm && selectedAlgorithm.params.length > 0 && (
        <div className="algorithm-params">
          <h4>Parameters</h4>
          {selectedAlgorithm.params.map(param => (
            <div key={param.id} className="form-group">
              <label>{param.name}:</label>
              {renderParameterInput(param)}
              {param.min !== undefined && param.max !== undefined && (
                <span className="param-range">
                  Range: {param.min} - {param.max}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector; 