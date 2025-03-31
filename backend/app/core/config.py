"""Configuration for available algorithms and distributions."""

# Available Algorithms
ALGORITHMS = [
    {
        "id": "epsilon_greedy",
        "name": "Epsilon-Greedy",
        "params": [
            {
                "id": "epsilon",
                "name": "Epsilon",
                "type": "float",
                "min": 0,
                "max": 1,
                "default": 0.1
            }
        ]
    },
    {
        "id": "ucb1",
        "name": "UCB1",
        "params": [
            {
                "id": "c",
                "name": "Exploration Constant",
                "type": "float",
                "min": 0,
                "default": 1.414  # sqrt(2)
            }
        ]
    },
    {
        "id": "thompson_sampling",
        "name": "Thompson Sampling",
        "params": []  # No parameters
    }
]

# Available Distributions
DISTRIBUTIONS = [
    {
        "id": "bernoulli",
        "name": "Bernoulli",
        "params": [
            {
                "id": "p",
                "name": "Probability (p)",
                "type": "float",
                "min": 0,
                "max": 1,
                "default": 0.5
            }
        ]
    },
    {
        "id": "gaussian",
        "name": "Gaussian",
        "params": [
            {
                "id": "mean",
                "name": "Mean",
                "type": "float",
                "default": 0
            },
            {
                "id": "stddev",
                "name": "Standard Deviation",
                "type": "float",
                "min": 0.000001,  # Avoid zero
                "default": 1
            }
        ]
    }
] 