# Triển khai Thôn Trang Liên Nhất - Docker

Triển khai đầy đủ cho website Thôn Trang Liên Nhất với Docker Compose.

## Chuẩn bị

1. Tạo network cho Traefik:
```bash
docker network create web
```

2. Khởi tạo file acme.json:
```bash
touch acme.json
chmod 600 acme.json
```

## Triển khai

```bash
docker-compose up -d
```

## Cấu hình DNS

1. Tạo bản ghi A cho `thontrangliennhat.com` trỏ đến IP của server
2. Tạo bản ghi A cho `api.thontrangliennhat.com` trỏ đến IP của server

## Cấu trúc thư mục
- traefik.yml: Cấu hình Traefik làm reverse proxy
- acme.json: Lưu trữ chứng chỉ SSL
- docker-compose.yml: Cấu hình triển khai

## Các file riêng biệt
- Dockerfile-api: Dockerfile cho API
- Dockerfile-frontend: Dockerfile cho Frontend
- docker-compose-api.yml: Docker Compose cho chỉ API
- docker-compose-frontend.yml: Docker Compose cho Frontend 