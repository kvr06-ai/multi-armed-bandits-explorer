import axios from 'axios';
import { 
  AlgorithmDefinition, 
  DistributionDefinition, 
  SimulationRequest,
  SimulationResponse 
} from '../types';

const API_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAlgorithms = async (): Promise<AlgorithmDefinition[]> => {
  const response = await apiClient.get<AlgorithmDefinition[]>('/config/algorithms');
  return response.data;
};

export const getDistributions = async (): Promise<DistributionDefinition[]> => {
  const response = await apiClient.get<DistributionDefinition[]>('/config/distributions');
  return response.data;
};

export const runSimulation = async (request: SimulationRequest): Promise<SimulationResponse> => {
  const response = await apiClient.post<SimulationResponse>('/simulations', request);
  return response.data;
}; 