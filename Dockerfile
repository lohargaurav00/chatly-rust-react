# Base image for all stages
FROM node:22-alpine3.20 AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
# Copy package files to install dependencies
COPY package*.json ./
COPY prisma ./prisma
# Install all dependencies, including legacy peer dependencies
RUN npm install --legacy-peer-deps

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
# Copy installed node modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .
# Build the application
RUN npm run build

# Stage 3: Prepare the production server
FROM base AS server
WORKDIR /app

# Copy necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/ca.pem ./ca.pem

# Set the environment variable for production
ENV NODE_ENV=production
# Expose port 3000 for the application
EXPOSE 3000
# Define the command to start the server
ENTRYPOINT ["node", "server.js"]

