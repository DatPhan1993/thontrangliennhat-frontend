const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Khởi tạo app Express
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['https://www.thontrangliennhat.com', 'https://thontrangliennhat.com', process.env.CORS_ORIGIN || '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Định nghĩa đường dẫn thư mục
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'public/uploads');
const imagesDir = path.join(__dirname, process.env.IMAGE_DIR || 'public/images');

// Chỉ tạo thư mục khi không chạy trên Vercel
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Phục vụ nội dung tĩnh khi không chạy trên Vercel
  app.use('/uploads', express.static(uploadsDir));
  app.use('/images', express.static(imagesDir));
} else {
  // Trên Vercel, không hỗ trợ lưu trữ file
  app.use('/uploads', (req, res) => {
    res.status(200).json({ 
      message: 'Uploads không khả dụng trên môi trường Vercel. Bạn cần sử dụng dịch vụ lưu trữ bên ngoài.',
      docs: 'https://vercel.com/docs/concepts/functions/serverless-functions#file-system'
    });
  });
  
  app.use('/images', (req, res) => {
    res.status(200).json({ 
      message: 'Images không khả dụng trên môi trường Vercel. Bạn cần sử dụng dịch vụ lưu trữ bên ngoài.',
      docs: 'https://vercel.com/docs/concepts/functions/serverless-functions#file-system'
    });
  });
}

// Route mặc định
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Thôn Trang Liên Nhất',
    status: 'active',
    environment: isVercel ? 'vercel' : 'development',
    time: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'API đang hoạt động bình thường',
    version: '1.0.0',
    environment: isVercel ? 'vercel' : 'development'
  });
});

// Thêm các routes mà frontend đang gọi đến
// Route cho tin tức
app.get('/api/news', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Thôn Trang Liên Nhật chuẩn bị lễ 30-4',
      summary: 'Mùa hè đã về, Thôn Trang Liên Nhật lại rộn ràng chuẩn bị đón bước chân của những người yêu thiên nhiên, thích khám phá và muốn tìm về chốn bình yên',
      content: 'Mùa hè đã về, Thôn Trang Liên Nhật lại rộn ràng chuẩn bị đón bước chân của những người yêu thiên nhiên, thích khám phá và muốn tìm về chốn bình yên. Hẹn gặp bạn giữa mênh mông đồng nội, hoa cỏ và nắng vàng!',
      images: '/images/news/thon-trang-lien-nhat.jpg',
      slug: 'lien-nhat',
      views: 120,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Mô hình sinh kế 3 trong 1',
      summary: 'HTX sản xuất Nông Nghiệp và Dịch vụ tổng hợp Liên Nhật luôn đi theo hướng nông nghiệp sạch, sản xuất nông sản theo hướng hữu cơ',
      content: 'HTX sản xuất Nông Nghiệp và Dịch vụ tổng hợp Liên Nhật luôn đi theo hướng nông nghiệp sạch, sản xuất nông sản theo hướng hữu cơ, kết hợp nuôi trồng thuỷ sản và các loại hình dịch vụ để thay đổi hướng phát triển nông nghiệp hiện nay.',
      images: '/images/news/mo-hinh-sinh-ke.jpg',
      slug: 'mo-hinh-sinh-ke',
      views: 85,
      createdAt: new Date().toISOString()
    }
  ]);
});

// Route cho menu navigation
app.get('/api/parent-navs/all-with-child', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'TRANG CHỦ',
      slug: '/',
      children: []
    },
    {
      id: 2,
      name: 'GIỚI THIỆU',
      slug: '/gioi-thieu',
      children: [
        { id: 21, name: 'Về Chúng Tôi', slug: '/gioi-thieu/ve-chung-toi' },
        { id: 22, name: 'Lịch Sử', slug: '/gioi-thieu/lich-su' }
      ]
    },
    {
      id: 3,
      name: 'SẢN PHẨM',
      slug: '/san-pham',
      children: []
    },
    {
      id: 4,
      name: 'DỊCH VỤ',
      slug: '/dich-vu',
      children: []
    },
    {
      id: 5,
      name: 'TRẢI NGHIỆM',
      slug: '/trai-nghiem',
      children: []
    },
    {
      id: 6,
      name: 'TIN TỨC',
      slug: '/tin-tuc',
      children: []
    },
    {
      id: 7,
      name: 'LIÊN HỆ',
      slug: '/lien-he',
      children: []
    }
  ]);
});

// Route cho experiences
app.get('/api/experiences', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        title: 'Khu du lịch sinh thái',
        description: 'Trải nghiệm thiên nhiên trong lành',
        image: 'https://via.placeholder.com/800x600',
        content: 'Nội dung chi tiết về khu du lịch sinh thái'
      },
      {
        id: 2,
        title: 'Ẩm thực đặc sản',
        description: 'Khám phá hương vị địa phương',
        image: 'https://via.placeholder.com/800x600',
        content: 'Nội dung chi tiết về ẩm thực đặc sản'
      }
    ]
  });
});

// Ví dụ về API bảo vệ bằng JWT
app.get('/api/secure', verifyToken, (req, res) => {
  res.json({
    message: 'Đây là nội dung bảo mật',
    user: req.user
  });
});

// Ví dụ login API đơn giản
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Đây chỉ là mẫu, trong thực tế cần kiểm tra từ database
  if (username === 'admin' && password === 'admin123') {
    const user = { id: 1, username: 'admin', role: 'admin' };
    const token = jwt.sign(
      user, 
      process.env.JWT_SECRET || 'jHdBu8Tgq3pL5vR7xZ2AsSw9Kf1YmN4EcX6QoWzDnV0OpI8M', 
      { expiresIn: '24h' }
    );
    
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
  }
});

// Middleware xác thực token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'jHdBu8Tgq3pL5vR7xZ2AsSw9Kf1YmN4EcX6QoWzDnV0OpI8M', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }
      
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: 'Không tìm thấy token' });
  }
}

// Xử lý favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Xử lý favicon.png
app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// Xử lý các static assets khác
app.get('*.png', (req, res) => {
  res.status(204).end();
});

app.get('*.jpg', (req, res) => {
  res.status(204).end();
});

app.get('*.svg', (req, res) => {
  res.status(204).end();
});

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Không tìm thấy route này',
    path: req.path
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Môi trường: ${isVercel ? 'Vercel' : 'Development'}`);
}); 