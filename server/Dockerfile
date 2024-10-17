# Use the pre-built Docker image with cargo-chef and the Rust toolchain
FROM rust:alpine AS builder

# Set the working directory
WORKDIR /app

# Adding necessary build packages
RUN apk add --no-cache openssl-dev libc-dev openssl-libs-static

# Copy source code and build the application
COPY . .

# Build the application
RUN cargo build --release 

# Stage for the final application image
FROM alpine:3.20 AS server

# Install necessary packages
RUN apk add --no-cache ca-certificates

# Copy the built application from the builder stage
COPY --from=builder /app/target/release/server /usr/local/bin/server

# Expose the application port
EXPOSE 8000

# Set the entry point for the container
ENTRYPOINT ["/usr/local/bin/server"]
