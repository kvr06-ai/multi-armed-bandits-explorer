# Multi-Armed Bandit Explorer

An interactive web application for exploring and visualizing multi-armed bandit algorithms.

## Overview

This tool allows you to:

- Configure different bandit problems with various reward distributions
- Choose from multiple bandit algorithms with customizable parameters
- Run simulations and visualize the results
- Compare algorithm performance across metrics like cumulative reward, regret, and arm selection

## Features

- **Bandit Problem Setup**: Configure arms with Bernoulli or Gaussian reward distributions
- **Algorithm Selection**: Choose from Epsilon-Greedy, UCB1, and Thompson Sampling algorithms
- **Interactive Visualizations**: See how algorithms perform over time
- **Algorithm Comparison**: Run multiple algorithms on the same problem for direct comparison
- **Client-Side Implementation**: All simulations run directly in your browser - no server required!

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/kvr06-ai/multi-armed-bandits-explorer.git
cd multi-armed-bandits-explorer
```

2. Set up the frontend

```bash
cd frontend
npm install  # or yarn
```

### Running the Application

#### Quick Start

The easiest way to run the application is using the provided script:

```bash
chmod +x run.sh
./run.sh
```

This will start the frontend server.

#### Manual Start

```bash
cd frontend
npm run dev  # or yarn dev
```

The application will be available at http://localhost:5173

### Troubleshooting

If you encounter any issues running the application, please see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common problems.

## How It Works

This application is completely client-side, with all bandit algorithms implemented in TypeScript. The simulation runs in your browser, providing immediate feedback without requiring a server connection.

Key components:
- **Bandit Algorithms**: Implementation of popular MAB algorithms (Epsilon-Greedy, UCB1, Thompson Sampling)
- **Arm Distributions**: Bernoulli and Gaussian reward distributions
- **Simulation Engine**: Runs multiple trials and aggregates results
- **Visualization**: Interactive charts to explore algorithm performance

## Technology Stack

- **Frontend**: React, TypeScript, Plotly.js
- **Styling**: CSS

## License

[MIT License](LICENSE)

## Acknowledgements

This tool was built to help understand and visualize reinforcement learning algorithms for educational purposes. 