# Use the pre-built Docker image with cargo-chef and the Rust toolchain
FROM lukemathwalker/cargo-chef:latest-rust-1.81 AS chef
WORKDIR /app

# Stage for planning the build
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage for building the application
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

# Build dependencies (this creates a cached layer)
RUN cargo chef cook --recipe-path recipe.json

# Copy source code and build the application
COPY . .
RUN cargo build --release 

# Stage for the final application image
FROM debian:bookworm-slim AS server

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy the built application from the builder stage
COPY --from=builder /app/target/release/server /usr/local/bin/server

# Expose the application port
EXPOSE 8000

# Set the entry point for the container
ENTRYPOINT ["/usr/local/bin/server"]
