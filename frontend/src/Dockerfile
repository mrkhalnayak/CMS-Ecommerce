# Stage 1: Build the React app
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:1.21-alpine
# Copy the built assets from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html
# Nginx serves on port 80 by default
EXPOSE 80
# When the container starts, nginx will start
CMD ["nginx", "-g", "daemon off;"]