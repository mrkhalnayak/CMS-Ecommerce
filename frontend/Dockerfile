# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies (use --legacy-peer-deps if needed)
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build the app (add --max_old_space_size if needed)
RUN npm run build

# Stage 2: Serve static files via lightweight HTTP server
FROM nginx:1.21-alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# No custom nginx.conf needed (handled by EKS Ingress)
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]