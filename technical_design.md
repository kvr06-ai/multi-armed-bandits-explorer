# Technical Design Document: Multi-Armed Bandit Explorer
**Version:** 1.0
**Date:** 2025-03-30
**Author:** Principal Product Manager (Gemini)
**Status:** Proposed

## 1. Introduction

### 1.1. Overview
The Multi-Armed Bandit (MAB) problem is a classic reinforcement learning scenario where an agent must allocate a fixed set of resources between competing choices (the "arms") in a way that maximizes their expected gain, when each choice's properties are only partially known at the time of allocation. The agent must balance "exploration" (gathering new information about arms) and "exploitation" (using known information to make the best current decision).

The "Multi-Armed Bandit Explorer" is envisioned as an interactive web-based tool designed for educational, research, and comparative analysis purposes. It allows users to configure, simulate, visualize, and compare the performance of various MAB algorithms under different conditions.

### 1.2. Goals
* Provide an intuitive user interface for configuring MAB problems and algorithms.
* Implement a core set of standard MAB algorithms (e.g., Epsilon-Greedy, UCB1, Thompson Sampling).
* Support common reward distributions for bandit arms (e.g., Bernoulli, Gaussian).
* Run simulations over a specified time horizon (number of steps/pulls).
* Visualize key performance metrics in real-time or upon completion (e.g., cumulative reward, regret, arm selection frequency).
* Enable side-by-side comparison of multiple algorithm configurations.
* Provide a clear and understandable presentation of simulation results.
* Design the system with extensibility in mind for adding new algorithms and reward distributions.

### 1.3. Non-Goals
* This is **not** intended as a production A/B testing platform for live systems.
* It will **not** integrate directly with external applications for real-time decision-making in its initial version.
* It will **not** initially support contextual bandits (where side information influences arm selection).
* It will **not** initially support non-stationary bandits (where reward distributions change over time).
* User accounts and persistent storage of simulation configurations beyond the current session are **not** part of V1.

### 1.4. Target Audience
* Students learning about reinforcement learning and decision-making under uncertainty.
* Researchers experimenting with MAB algorithms.
* Data scientists and engineers evaluating potential algorithms for optimization tasks (e.g., A/B testing variations, ad selection).
* Educators demonstrating MAB concepts.

## 2. High-Level Architecture

The system will follow a standard client-server web application architecture:

* **Frontend (Client):** A browser-based Single Page Application (SPA) responsible for the user interface, configuration input, visualization rendering, and communication with the backend API.
    * **Technology:** React (Recommended, but Vue.js or Svelte are acceptable). JavaScript/TypeScript.
    * **Libraries:** State Management (e.g., Zustand, Redux Toolkit), Charting (e.g., Plotly.js, Chart.js), UI Components (e.g., Material UI, Ant Design).
* **Backend (Server):** A server application responsible for handling API requests, running the MAB simulations, calculating metrics, and returning results.
    * **Technology:** Python (Recommended due to data science ecosystem).
    * **Framework:** FastAPI (Recommended for performance and automatic API docs) or Flask.
    * **Libraries:** NumPy (for numerical operations), SciPy.stats (for distributions), standard Python libraries.
* **API:** A RESTful API layer facilitating communication between the frontend and backend.

**Simulation Execution Model (V1):** Synchronous or simple Asynchronous within the web server process. For V1, API requests to run simulations will block until the simulation completes (for short/moderate simulations) or utilize Python's `asyncio` capabilities within the API framework if feasible without a dedicated task queue. This simplifies the initial architecture. A task queue (like Celery/Redis) can be added later if needed for very long-running simulations.

## 3. Key Features & User Stories

* **F1: Algorithm Selection & Configuration:**
    * As a user, I want to select an MAB algorithm from a predefined list (Epsilon-Greedy, UCB1, Thompson Sampling).
    * As a user, I want to configure the specific parameters for the chosen algorithm (e.g., epsilon for Epsilon-Greedy, confidence parameter `c` for UCB1). Input fields must have appropriate validation (e.g., epsilon between 0 and 1).
* **F2: Bandit Problem Definition:**
    * As a user, I want to define the number of arms for the bandit problem (minimum 2).
    * As a user, for each arm, I want to select its true reward distribution type (e.g., Bernoulli, Gaussian) from a predefined list.
    * As a user, for each arm, I want to specify the parameters of its chosen reward distribution (e.g., `p` for Bernoulli, `mean` and `standard deviation` for Gaussian). Input fields must have validation.
* **F3: Simulation Control:**
    * As a user, I want to specify the total number of steps (time horizon) for the simulation.
    * As a user, I want to specify the number of independent simulation runs to average over (optional, default 1). This helps smooth out results.
    * As a user, I want to initiate the simulation run.
* **F4: Results Visualization:**
    * As a user, upon simulation completion, I want to see visualizations comparing the performance of the configured algorithm(s).
    * Required Visualizations:
        * **Cumulative Reward:** Line chart showing total accumulated reward over simulation steps.
        * **Cumulative Regret:** Line chart showing total opportunity loss (optimal reward - chosen reward) over simulation steps. Requires identifying the best arm beforehand based on true means.
        * **Average Reward:** Line chart showing the average reward per step (`cumulative_reward / step_number`) over simulation steps.
        * **Arm Selection Frequency:** Bar chart or Pie chart showing the percentage of times each arm was pulled over the entire simulation.
        * **(Optional V1/Stretch):** Arm Selection Trajectory: Stacked area chart or line chart showing the proportion of pulls for each arm over time.
* **F5: Comparative Analysis:**
    * As a user, I want to configure and run multiple simulation setups (different algorithms or parameter settings on the *same* bandit problem definition) simultaneously.
    * As a user, I want the visualizations (F4) to display the results for all configured setups on the same chart for direct comparison. Each setup should be clearly identifiable (e.g., different colors, legend).
* **F6: Results Export:**
    * As a user, I want to export the raw simulation data (e.g., reward per step, arm chosen per step, per run) as a CSV file.

## 4. Detailed Component Design

### 4.1. Frontend

* **Component Structure:**
    * `App`: Main application component, routing.
    * `ConfigurationPanel`: Container for all user inputs.
        * `SimulationSetupCard`: Represents a single simulation configuration (algorithm + params). Allows adding/removing setups for comparison.
        * `AlgorithmSelector`: Dropdown for algorithm choice, dynamically shows parameter inputs.
        * `BanditProblemConfig`: Defines number of arms and parameters for each arm's distribution.
            * `ArmConfig`: Component for configuring a single arm (distribution type + params).
        * `SimulationSettings`: Inputs for time horizon (`num_steps`), number of runs (`num_runs`).
    * `VisualizationArea`: Displays the charts.
        * `ChartWrapper`: Generic component to wrap a charting library instance (e.g., Plotly). Takes data and layout configuration.
        * Specific Chart Components (e.g., `CumulativeRewardChart`, `RegretChart`).
    * `ResultsSummary`: Displays key summary statistics (e.g., total reward, final regret).
    * `ControlBar`: Buttons to "Run Simulation", "Export Results".
* **State Management:**
    * Manage UI state (e.g., selected algorithm), configuration parameters (bandit setup, algorithm params, sim settings), simulation results, loading/error states.
    * Store configuration for potentially multiple simulation setups to be run in parallel/comparison.
* **API Client:** A service/module to handle all communication with the Backend API. Use `Workspace` or `axios`. Handle request/response cycles, loading states, and error reporting to the UI.
* **Charting:** Use a robust library like Plotly.js capable of handling multiple traces (lines) on a single chart for comparison. Ensure charts are responsive and clearly labelled.

### 4.2. Backend

* **API Server (FastAPI):**
    * **Endpoints:**
        * `GET /api/v1/config/algorithms`:
            * Response: `[{ "id": "epsilon_greedy", "name": "Epsilon-Greedy", "params": [ { "id": "epsilon", "name": "Epsilon", "type": "float", "min": 0, "max": 1, "default": 0.1 } ] }, ...]`
        * `GET /api/v1/config/distributions`:
            * Response: `[{ "id": "bernoulli", "name": "Bernoulli", "params": [ { "id": "p", "name": "Probability (p)", "type": "float", "min": 0, "max": 1, "default": 0.5 } ] }, ...]`
        * `POST /api/v1/simulations`:
            * Request Body:
                ```json
                {
                  "bandit_problem": {
                    "arms": [
                      { "distribution": { "id": "bernoulli", "params": { "p": 0.7 } } },
                      { "distribution": { "id": "gaussian", "params": { "mean": 0.6, "stddev": 0.2 } } }
                      // ... more arms
                    ]
                  },
                  "setups": [
                    {
                      "setup_id": "setup1", // Frontend generated unique ID for the run
                      "algorithm": { "id": "epsilon_greedy", "params": { "epsilon": 0.1 } }
                    },
                    {
                      "setup_id": "setup2",
                      "algorithm": { "id": "ucb1", "params": { "c": 2.0 } }
                    }
                    // ... more setups for comparison
                  ],
                  "num_steps": 1000,
                  "num_runs": 10 // Optional, defaults to 1 if omitted
                }
                ```
            * Response Body (Synchronous V1):
                ```json
                {
                  "results": [
                    {
                      "setup_id": "setup1",
                      "metrics": {
                        "steps": [1, 2, ..., 1000],
                        "avg_cumulative_reward": [...], // Averaged over num_runs
                        "stddev_cumulative_reward": [...],
                        "avg_cumulative_regret": [...],
                        "stddev_cumulative_regret": [...],
                        "avg_average_reward": [...],
                        "stddev_average_reward": [...],
                        "avg_arm_counts": [ // Final counts averaged over runs
                          { "arm_index": 0, "count": 150.5 },
                          { "arm_index": 1, "count": 849.5 }
                        ],
                        // Raw data per run might be too large for direct response;
                        // consider separate endpoint or only include if requested/needed for export
                        "raw_data_available": true // Flag indicating raw data can be fetched
                      },
                      "summary": {
                        "total_reward": ...,
                        "final_regret": ...
                      }
                    },
                    {
                      "setup_id": "setup2",
                      "metrics": { ... }, // Similar structure
                      "summary": { ... }
                    }
                  ]
                }
                ```
        * **(Optional) GET /api/v1/simulations/{run_id}/raw_data`: ** Used for CSV export if raw data is too large for the main response. Needs a way to identify the specific run/setup.
    * **Input Validation:** Use Pydantic models in FastAPI for automatic request body validation based on the defined structures. Perform semantic validation (e.g., std dev > 0).

* **Simulation Engine:**
    * **Core Classes:**
        * `RewardDistribution` (Abstract Base Class):
            * `__init__(self, params)`
            * `sample(self) -> float`: Returns a single reward draw.
            * `get_mean(self) -> float`: Returns the true mean reward (needed for regret calculation).
            * Concrete implementations: `BernoulliDistribution`, `GaussianDistribution`.
        * `Arm`:
            * `__init__(self, distribution: RewardDistribution)`
            * `pull(self) -> float`: Calls `distribution.sample()`.
            * `get_true_mean(self) -> float`: Calls `distribution.get_mean()`.
        * `BanditProblem`:
            * `__init__(self, arms: List[Arm])`
            * `get_num_arms(self) -> int`
            * `pull_arm(self, arm_index: int) -> float`
            * `get_optimal_arm_mean(self) -> float`: Calculates and returns the highest true mean among all arms.
        * `Algorithm` (Abstract Base Class):
            * `__init__(self, num_arms: int, params: dict)`
            * `select_arm(self) -> int`: Chooses which arm to pull next.
            * `update(self, chosen_arm: int, reward: float)`: Updates the algorithm's internal state.
            * `reset(self)`: Resets the algorithm's state for a new run.
            * Concrete implementations: `EpsilonGreedyAlgorithm`, `UCB1Algorithm`, `ThompsonSamplingBernoulliAlgorithm`.
        * `SimulationRunner`:
            * `run(self, problem: BanditProblem, algorithm: Algorithm, num_steps: int, num_runs: int) -> dict`:
                * Initializes data structures (e.g., NumPy arrays) to store results per run (rewards, regrets, arm choices).
                * Outer loop: `for run in range(num_runs):`
                    * Reset algorithm state: `algorithm.reset()`
                    * Inner loop: `for step in range(num_steps):`
                        * `chosen_arm = algorithm.select_arm()`
                        * `reward = problem.pull_arm(chosen_arm)`
                        * `algorithm.update(chosen_arm, reward)`
                        * Calculate instantaneous regret: `regret = problem.get_optimal_arm_mean() - reward`
                        * Store `step`, `chosen_arm`, `reward`, `regret`.
                * After all runs: Aggregate results (calculate mean and std dev across runs for cumulative reward, cumulative regret, average reward per step; average final arm counts).
                * Return aggregated results in the structured format defined for the API response.
    * **Data Structures:** Use NumPy arrays for efficient storage and calculation of time-series data (rewards, regrets) within a simulation run.

### 4.3. API Design Summary

| Method | Path                             | Description                                     | Request Body                         | Response Body                                    |
| :----- | :------------------------------- | :---------------------------------------------- | :----------------------------------- | :----------------------------------------------- |
| GET    | `/api/v1/config/algorithms`      | Get available algorithms and their params       | -                                    | List of algorithm definitions                    |
| GET    | `/api/v1/config/distributions`   | Get available reward distributions & params     | -                                    | List of distribution definitions                 |
| POST   | `/api/v1/simulations`            | Run one or more simulation setups               | Bandit problem, setups, steps, runs | Aggregated results for all setups                |
| (Opt) GET | `/api/v1/simulations/{id}/raw` | Get raw data for CSV export (if needed)       | -                                    | CSV data or structured raw data                  |

## 5. Data Model

* **Configuration Data (Frontend & API Request):** Defined by the `POST /api/v1/simulations` request body structure. Includes arm distributions/params, algorithm choices/params, simulation settings.
* **Results Data (Backend & API Response):** Defined by the `POST /api/v1/simulations` response body structure. Primarily time-series data (steps, rewards, regrets) potentially averaged over multiple runs, plus summary statistics and final arm counts. Data should be structured for easy consumption by charting libraries.

## 6. Algorithms Supported (V1)

1.  **Epsilon-Greedy:**
    * Parameters: `epsilon` (float, 0-1): Probability of exploring.
    * Logic: With probability `epsilon`, choose a random arm. Otherwise, choose the arm with the highest current estimated reward. Estimate is typically the sample mean of rewards received from that arm.
2.  **Upper Confidence Bound (UCB1):**
    * Parameters: `c` (float, >=0, often sqrt(2)): Exploration constant. Controls confidence interval width.
    * Logic: Choose arm `a` that maximizes `mean_reward(a) + c * sqrt(log(total_steps) / num_pulls(a))`. Add small epsilon to denominator `num_pulls(a)` to avoid division by zero initially. Requires pulling each arm once first.
3.  **Thompson Sampling (for Bernoulli Rewards):**
    * Parameters: None (implicitly uses Beta distribution priors).
    * Logic: Maintain a Beta distribution (Beta(alpha, beta)) for the success probability `p` of each arm. Initially Beta(1, 1) (uniform prior). To select an arm, sample a probability from each arm's current Beta distribution. Choose the arm with the highest sampled probability. Update the chosen arm's Beta distribution: `alpha += 1` if reward is 1 (success), `beta += 1` if reward is 0 (failure).

## 7. Reward Distributions Supported (V1)

1.  **Bernoulli:**
    * Parameters: `p` (float, 0-1): Probability of success (reward=1). Reward is 0 otherwise.
    * Implementation: Use `scipy.stats.bernoulli(p).rvs()` or equivalent `numpy.random.binomial(1, p)`.
    * Mean: `p`.
2.  **Gaussian (Normal):**
    * Parameters: `mean` (float), `stddev` (float, >0): Mean and standard deviation of the reward.
    * Implementation: Use `scipy.stats.norm(loc=mean, scale=stddev).rvs()` or `numpy.random.normal(loc=mean, scale=stddev)`.
    * Mean: `mean`.

## 8. Extensibility

* **Adding Algorithms:** Create a new Python class inheriting from the `Algorithm` abstract base class. Implement `__init__`, `select_arm`, `update`, and `reset`. Register the new algorithm (e.g., in a dictionary or list) so it appears in the `GET /api/v1/config/algorithms` response and can be selected by the `SimulationRunner`.
* **Adding Distributions:** Create a new Python class inheriting from `RewardDistribution`. Implement `__init__`, `sample`, and `get_mean`. Register the new distribution so it appears in `GET /api/v1/config/distributions` and can be used when defining arms.
* Frontend changes will be needed to display configuration options for new algorithms/distributions.

## 9. Deployment Considerations

* **Containerization:** Use Docker for both frontend (e.g., multi-stage build with Nginx serving static files) and backend (Python app). Use Docker Compose for local development setup.
* **Hosting:** Suitable for deployment on cloud platforms like Google Cloud Run, AWS App Runner/ECS Fargate, Azure Container Apps, or PaaS like Heroku.
* **Scalability:** The initial synchronous/simple async approach limits scalability under high concurrent load or very long simulations. If this becomes a bottleneck, introduce a task queue (Celery + Redis/RabbitMQ) and modify the API to return a task ID immediately, with polling endpoints for status/results.
* **Dependencies:** Clearly define Python (`requirements.txt` or `pyproject.toml`) and Node.js (`package.json`) dependencies.

## 10. Future Enhancements (Post V1)

* Support for Contextual Bandits.
* Support for Non-Stationary Bandit problems.
* More algorithms (e.g., Bayesian UCB, Gradient Bandits).
* More reward distributions (e.g., Exponential, Poisson).
* Saving/Loading simulation configurations (requires database/persistent storage).
* User accounts for managing saved configurations.
* Real-time visualization updates *during* simulation run (requires WebSockets or Server-Sent Events).
* More advanced comparison dashboards.
* Ability to upload custom reward datasets instead of using theoretical distributions.

## 11. Open Questions

* What is the expected maximum simulation length (`num_steps` * `num_runs`) that needs to be supported reliably within a reasonable web request timeout for V1 (influences sync vs async decision)? Assumption: < 30-60 seconds total compute time.
* Is there a preference for a specific charting library (Plotly.js assumed)?
* Is raw data export essential for V1, or can it be deferred? (Included for now).
* Should the backend calculate standard error of the mean instead of standard deviation when `num_runs > 1` for plotting confidence intervals? (Using StdDev for now for simplicity).