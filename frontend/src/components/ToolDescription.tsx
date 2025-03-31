import React from 'react';

const ToolDescription: React.FC = () => {
  return (
    <div className="tool-description">
      <h2>About This Tool</h2>
      
      <p>
        The Multi-Armed Bandit Explorer is an interactive tool that helps you understand 
        and visualize how different reinforcement learning algorithms perform in the classic 
        "Multi-Armed Bandit" problem.
      </p>
      
      <div className="description-section">
        <h3>What is a Multi-Armed Bandit Problem?</h3>
        <p>
          Imagine a gambler facing multiple slot machines (bandits), each with an unknown probability 
          of paying out. The gambler needs to decide which machines to play to maximize total reward. 
          This creates a classic exploration vs. exploitation dilemma:
        </p>
        <ul>
          <li><strong>Explore</strong>: Try different machines to gather information</li>
          <li><strong>Exploit</strong>: Play the machine that seems best based on current knowledge</li>
        </ul>
      </div>

      <div className="description-section">
        <h3>Supported Algorithms</h3>
        <ul>
          <li>
            <strong>Epsilon-Greedy</strong>: A simple strategy that selects the best arm with 
            probability 1-ε and explores randomly with probability ε. Adjust the epsilon parameter 
            to control the exploration rate.
          </li>
          <li>
            <strong>UCB1 (Upper Confidence Bound)</strong>: A more sophisticated approach that balances 
            exploitation with exploration by selecting arms based on their estimated value plus an 
            exploration bonus that decreases as an arm is pulled more frequently.
          </li>
          <li>
            <strong>Thompson Sampling</strong>: A Bayesian approach that maintains a probability distribution 
            over each arm's reward probability. It samples from these distributions and selects the arm 
            with the highest sampled value.
          </li>
        </ul>
      </div>

      <div className="description-section">
        <h3>How to Use This Tool</h3>
        <ol>
          <li>
            <strong>Configure Your Bandit Problem</strong>: Add arms and set their distributions 
            (Bernoulli for binary rewards, Gaussian for normally distributed rewards).
          </li>
          <li>
            <strong>Select Algorithms</strong>: Choose one or more algorithms to compare. 
            Adjust their parameters to see how they affect performance.
          </li>
          <li>
            <strong>Set Simulation Parameters</strong>: Define how many steps and runs to simulate.
            More runs provide more reliable results but take longer to compute.
          </li>
          <li>
            <strong>Run and Analyze</strong>: Click "Run Simulation" and explore the results.
            Look at metrics like cumulative reward, regret, and arm selection frequencies.
          </li>
        </ol>
      </div>

      <div className="description-section">
        <h3>Tips</h3>
        <ul>
          <li>Try creating scenarios with clear optimal arms vs. closely matched arms</li>
          <li>Adjust algorithm parameters to see how they affect the exploration-exploitation trade-off</li>
          <li>Compare multiple algorithms on the same problem to understand their strengths and weaknesses</li>
          <li>All simulations run directly in your browser - experiment freely!</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolDescription; 