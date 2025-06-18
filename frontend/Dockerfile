# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy the build output to NGINX's default HTML directory
COPY --from=builder /app/build /usr/share/nginx/html

# (Optional) Remove default NGINX config if not needed
RUN rm /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
