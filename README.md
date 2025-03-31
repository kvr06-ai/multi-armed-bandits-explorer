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

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/multi-armed-bandits-explorer.git
cd multi-armed-bandits-explorer
```

2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

3. Set up the frontend

```bash
cd ../frontend
npm install  # or yarn
```

### Running the Application

#### Quick Start

The easiest way to run the application is using the provided script:

```bash
chmod +x run.sh
./run.sh
```

This will start both the backend and frontend servers.

#### Manual Start

1. Start the backend server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The server will start at http://localhost:8000

2. Start the frontend development server

```bash
cd frontend
npm run dev  # or yarn dev
```

The application will be available at http://localhost:5173

### Troubleshooting

If you encounter any issues running the application, please see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common problems.

## Technology Stack

- **Backend**: FastAPI, NumPy, SciPy
- **Frontend**: React, TypeScript, Plotly.js
- **Styling**: CSS

## License

[MIT License](LICENSE)

## Acknowledgements

This tool was built to help understand and visualize reinforcement learning algorithms for educational purposes. 