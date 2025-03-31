#!/bin/bash
# Script to start both backend and frontend for the Multi-Armed Bandit Explorer
# 
# Note: This script has been updated to handle compatibility issues with newer Python
# and library versions. It uses pip with looser version requirements and updates
# code to be compatible with Pydantic 2.x and newer Python versions.

# Function to kill all child processes when script is terminated
function cleanup {
    echo "Stopping all processes..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

echo "Starting Multi-Armed Bandit Explorer..."

# Check if Python is installed
if ! command -v python3 &>/dev/null; then
    echo "Error: Python 3 is required but not found."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
    echo "Error: Node.js is required but not found."
    exit 1
fi

echo "Setting up backend..."
# Create backend directory structure if it doesn't exist
mkdir -p backend/app/api/endpoints backend/app/models backend/app/core

# Start the backend server
echo "Starting the backend server..."
cd backend
# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate

# Ensure pip and setuptools are up to date
echo "Updating pip and setuptools..."
pip install --upgrade pip setuptools wheel

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Start the backend
echo "Starting backend server..."
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

echo "Setting up frontend..."
# Create frontend directory structure if it doesn't exist
mkdir -p frontend/src/components frontend/src/api frontend/src/types

# Start the frontend development server
echo "Starting the frontend development server..."
cd frontend
echo "Installing frontend dependencies..."
npm install --quiet
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both servers are now running!"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

# Wait for processes to finish (or until script is terminated)
wait $BACKEND_PID $FRONTEND_PID 