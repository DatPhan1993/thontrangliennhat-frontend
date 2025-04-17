# Thôn Trang Liên Nhất Frontend

Đây là phần frontend của dự án website Thôn Trang Liên Nhất, được xây dựng bằng React và được triển khai bằng Docker.

## Cấu trúc dự án

- `build/`: Thư mục chứa các file đã build của ứng dụng React
- `Dockerfile`: File cấu hình để build Docker image cho frontend
- `nginx.conf`: Cấu hình Nginx cho web server
- `docker-compose.yml`: Cấu hình Docker Compose cho môi trường phát triển
- `docker-compose.prod.yml`: Cấu hình Docker Compose cho môi trường sản xuất
- `traefik/`: Thư mục chứa cấu hình Traefik làm reverse proxy cho môi trường sản xuất

## Triển khai

### Môi trường phát triển

```bash
docker-compose up
```

### Môi trường sản xuất

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Cấu hình DNS

Để triển khai lên tên miền thontrangliennhat.com, cần cấu hình DNS như sau:

1. Tạo bản ghi A cho thontrangliennhat.com trỏ đến IP của máy chủ
2. Tạo bản ghi A cho api.thontrangliennhat.com trỏ đến cùng IP của máy chủ 