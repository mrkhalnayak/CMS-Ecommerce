# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy only package files first (better caching)
COPY package.json package-lock.json* ./

# 2. Install dependencies with clean cache
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --prefer-offline

# 3. Copy all other files
COPY . .

# 4. Build with increased memory limit
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

# Stage 2: Serve static files
FROM nginx:1.21-alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]