# Stage 1: Build the Angular Single Page Application
FROM node:18-alpine AS build

WORKDIR /app

# Enable legacy OpenSSL provider for Angular 12 Webpack compilation
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Install dependencies using cache
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source code and build for production
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the compiled app with high-performance Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled Angular distribution files from builder stage
COPY --from=build /app/dist/employee-management-frontend /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
