#!/bin/sh

# Function to start the frontend
start_frontend() {
    echo "Starting Frontend"
    pnpm next dev &  # Start the frontend process in the background
    FRONTEND_PID=$!
    echo "Frontend Started with PID $FRONTEND_PID"
}

# Function to start the backend
start_backend() {
    echo "Starting Backend"
    (cd server && cargo run) &  # Start the backend process in the background
    BACKEND_PID=$!
    echo "Backend Started with PID $BACKEND_PID"
}

# Main script execution
echo "Starting Execution"

start_frontend
start_backend

# Wait for both processes to complete
wait $FRONTEND_PID $BACKEND_PID
# wait $FRONTEND_PID

echo "Execution Completed"
