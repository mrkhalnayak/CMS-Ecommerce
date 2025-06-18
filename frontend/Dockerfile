# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# First copy only package.json
COPY package.json .

# Install dependencies (force generate lockfile if missing)
RUN npm install --legacy-peer-deps

# Now copy all other files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve static files
FROM nginx:1.21-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]