#!/bin/bash
# Script to start the Multi-Armed Bandit Explorer

# Function to kill all child processes when script is terminated
function cleanup {
    echo "Stopping processes..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

echo "Starting Multi-Armed Bandit Explorer..."

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
    echo "Error: Node.js is required but not found."
    exit 1
fi

# Start the frontend development server
echo "Starting the frontend server..."
cd frontend
echo "Installing dependencies..."
npm install --quiet
echo "Starting server..."
npm run dev &
APP_PID=$!

echo "Application is now running!"
echo "Open http://localhost:5173 in your browser"
echo "Press Ctrl+C to stop the server."

# Wait for processes to finish (or until script is terminated)
wait $APP_PID 