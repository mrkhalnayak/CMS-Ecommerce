# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with clean cache
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --prefer-offline

# Copy all source files
COPY . .

# Build with increased memory
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

# Stage 2: Serve static files
FROM nginx:1.21-alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]