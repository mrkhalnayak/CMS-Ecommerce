# Stage 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the static files for production
RUN npm run build

# --- Stage 2: Serve the built assets with Nginx ---
FROM nginx:1.21-alpine

# Copy only the built artifacts from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# Tell Docker that the container listens on port 80
EXPOSE 80

# The default Nginx command starts the server.
CMD ["nginx", "-g", "daemon off;"]