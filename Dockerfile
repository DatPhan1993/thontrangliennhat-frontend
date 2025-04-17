# Sử dụng NGINX làm web server
FROM nginx:stable-alpine

# Copy thư mục build đã có sẵn vào container
COPY build/ /usr/share/nginx/html

# Copy cấu hình NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 