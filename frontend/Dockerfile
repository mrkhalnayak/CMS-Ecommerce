# Stage 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies (use --legacy-peer-deps if needed)
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the static files for production
RUN npm run build

# --- Stage 2: Serve the built assets with Nginx ---
FROM nginx:1.21-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built artifacts from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# Tell Docker that the container listens on port 80
EXPOSE 80

# The default Nginx command starts the server
CMD ["nginx", "-g", "daemon off;"]