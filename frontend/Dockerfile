# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (using wildcard to handle missing package-lock.json)
COPY package*.json ./

# Install dependencies (create package-lock.json if missing)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Copy all source files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve static files
FROM nginx:1.21-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]