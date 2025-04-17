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
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy route này' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Môi trường: ${isVercel ? 'Vercel' : 'Development'}`);
}); 