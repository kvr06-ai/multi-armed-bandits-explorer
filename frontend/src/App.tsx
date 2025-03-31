import { useState, useEffect } from 'react'
import './App.css'
import { API, Algorithm, Distribution, SimulationRequest, SimulationResponse } from './api/client'
import ConfigurationPanel from './components/ConfigurationPanel'
import ResultsDisplay from './components/ResultsDisplay'

function App() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [results, setResults] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const [algorithmsData, distributionsData] = await Promise.all([
          API.getAlgorithms(),
          API.getDistributions()
        ])
        
        setAlgorithms(algorithmsData)
        setDistributions(distributionsData)
      } catch (err) {
        console.error('Error fetching configuration data:', err)
        setError('Failed to load configuration data')
      }
    }
    
    fetchConfigData()
  }, [])
  
  const handleRunSimulation = async (simulationConfig: SimulationRequest) => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Running simulation with config:', simulationConfig)
      const response = await API.runSimulation(simulationConfig)
      
      setResults(response)
      setLoading(false)
    } catch (err: unknown) {
      console.error('Simulation error:', err)
      setError('Simulation failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setLoading(false)
    }
  }
  
  if (error && !algorithms.length && !distributions.length) {
    return (
      <div className="app-container">
        <header>
          <h1>Multi-Armed Bandit Explorer</h1>
          <p>Interactive tool for exploring and visualizing bandit algorithms</p>
        </header>
        <div className="error-container">
          <h2>Error: {error}</h2>
        </div>
      </div>
    )
  }
  
  return (
    <div className="app-container">
      <header>
        <h1>Multi-Armed Bandit Explorer</h1>
        <p>Interactive tool for exploring and visualizing bandit algorithms</p>
        <div className="client-side-note">
          <small>All simulations run in your browser - no server required!</small>
        </div>
      </header>
      
      <main>
        <ConfigurationPanel 
          algorithms={algorithms} 
          distributions={distributions}
          onRunSimulation={handleRunSimulation}
          loading={loading}
        />
        
        {results && (
          <ResultsDisplay results={results.results} />
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </main>
      
      <footer>
        <p>Built for educational purposes | <a href="https://github.com/kvr06-ai/multi-armed-bandits-explorer" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
