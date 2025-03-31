import { useState } from 'react'
import './App.css'
import ConfigurationPanel from './components/ConfigurationPanel'
import ResultsDisplay from './components/ResultsDisplay'
import { SimulationRequest, SimulationResponse, SimulationResult } from './types'
import { runSimulation } from './api/client'

function App() {
  const [results, setResults] = useState<SimulationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleRunSimulation = async (request: SimulationRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Run the simulation via API
      const response = await runSimulation(request)
      
      // Update results
      setResults(response.results)
    } catch (err) {
      console.error('Simulation error:', err)
      setError('Failed to run simulation. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi-Armed Bandit Explorer</h1>
        <p>Interactive tool for exploring and visualizing bandit algorithms</p>
      </header>
      
      <main className="app-content">
        <div className="container">
          <div className="configuration">
            <ConfigurationPanel 
              onRunSimulation={handleRunSimulation}
              isLoading={isLoading}
            />
          </div>
          
          <div className="results">
            {error && <div className="error-message">{error}</div>}
            {results.length > 0 && <ResultsDisplay results={results} />}
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Built for educational purposes | <a href="https://github.com/yourusername/multi-armed-bandits-explorer" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  )
}

export default App
