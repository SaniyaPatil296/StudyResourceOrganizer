
# Stage 1: Build React application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Use Nginx-relative API URL in production
ENV VITE_API_URL=/api

# Build production frontend
RUN npm run build

# Stage 2: Nginx production server
FROM nginx:alpine

# Copy React production files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
