# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code và build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files từ stage trước
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose cổng
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 