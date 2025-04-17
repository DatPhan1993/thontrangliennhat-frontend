# Thôn Trang Liên Nhất API

Đây là phần backend API của dự án website Thôn Trang Liên Nhất, được xây dựng bằng Node.js và được triển khai bằng Docker.

## Cấu trúc dự án

- `Dockerfile`: File cấu hình để build Docker image cho API
- `ecosystem.config.js`: Cấu hình PM2 để quản lý ứng dụng Node.js
- `public/uploads/`: Thư mục chứa các file upload từ người dùng
- `public/images/`: Thư mục chứa các file hình ảnh của hệ thống

## Triển khai

API được triển khai cùng với frontend thông qua Docker Compose:

```bash
# Môi trường phát triển
docker-compose up

# Môi trường sản xuất
docker-compose -f docker-compose.prod.yml up -d
```

## Cấu hình DNS

Để triển khai lên tên miền api.thontrangliennhat.com, cần cấu hình DNS như sau:
- Tạo bản ghi A cho api.thontrangliennhat.com trỏ đến IP của máy chủ 