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

// Đảm bảo thư mục uploads và images tồn tại
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'public/uploads');
const imagesDir = path.join(__dirname, process.env.IMAGE_DIR || 'public/images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Phục vụ nội dung tĩnh
app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(imagesDir));

// Route mặc định
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Thôn Trang Liên Nhất',
    status: 'active',
    time: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'API đang hoạt động bình thường',
    version: '1.0.0'
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
}); 