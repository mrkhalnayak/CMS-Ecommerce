# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create lightweight serving image
FROM busybox:musl

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/build /app

# Simple HTTP server (optional, just to keep the container running)
CMD ["sh", "-c", "while true; do sleep 3600; done"]