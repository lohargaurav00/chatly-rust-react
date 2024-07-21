#!/bin/sh

# Function to start the frontend
start_frontend() {
    echo "Starting Frontend"
    pnpm next dev &  # Start the frontend process in the background
    FRONTEND_PID=$!
    echo "Frontend Started with PID $FRONTEND_PID"
}

# Function to start the backend with cargo watch
start_backend_with_watch() {
    echo "Starting Backend with cargo watch"
    (cd server && cargo watch -x run)
}

# Function to start the backend with cargo run as a fallback
start_backend_fallback() {
    echo "cargo watch failed, falling back to cargo run"
    (cd server && cargo run)
}


# Function to start the backend
start_backend() {
    echo "Starting Backend"
    start_backend_with_watch || start_backend_fallback &  # Start the backend process in the background
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
