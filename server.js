const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

// Add a static file handler function
const serveStaticFile = (req, res, filePath, contentType = 'image/jpeg') => {
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', fileData.length);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.statusCode = 200;
            res.end(fileData);
            return true;
        }
    } catch (error) {
        console.error(`Error serving file ${filePath}:`, error);
    }
    return false;
};

// Đường dẫn tới database.json
const DB_PATH = path.join(__dirname, 'phunongbuondon-api', 'database.json');
const PUBLIC_DB_PATH = path.join(__dirname, 'public', 'phunongbuondon-api', 'database.json');

// Đọc database
const readDatabase = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc database:', error);
        return { videos: [], images: [], experiences: [], services: [] };
    }
};

// Ghi database
const writeDatabase = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        
        // Sao chép vào thư mục public nếu tồn tại
        try {
            if (fs.existsSync(path.dirname(PUBLIC_DB_PATH))) {
                fs.writeFileSync(PUBLIC_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
                console.log('Database đã được cập nhật trong public');
            }
        } catch (copyError) {
            console.error('Không thể sao chép vào public:', copyError);
        }
        
        return true;
    } catch (error) {
        console.error('Lỗi khi ghi database:', error);
        return false;
    }
};

// Xử lý yêu cầu API
const handleApiRequest = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With, Authorization');
    
    // Xử lý OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    
    // Log chi tiết request để debug
    console.log(`API Request: ${req.method} ${pathname}`);
    console.log(`Content-Type: ${req.headers['content-type']}`);
    
    // API videos
    if (pathname === '/api/videos') {
        if (req.method === 'GET') {
            // Lấy danh sách videos
            const db = readDatabase();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ data: db.videos || [] }));
        } else if (req.method === 'POST') {
            // Thêm video mới
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const videoData = JSON.parse(body);
                    const db = readDatabase();
                    
                    // Đảm bảo có mảng videos
                    if (!db.videos) db.videos = [];
                    
                    // Tạo ID mới
                    const newId = db.videos.length > 0 
                        ? Math.max(...db.videos.map(video => Number(video.id) || 0)) + 1 
                        : 1;
                    
                    // Tạo video mới
                    const newVideo = {
                        id: newId,
                        url: videoData.url,
                        name: videoData.name,
                        description: videoData.description,
                        created_at: new Date().toISOString(),
                        createdAt: new Date().toISOString()
                    };
                    
                    // Thêm vào database
                    db.videos.push(newVideo);
                    
                    // Lưu database
                    if (writeDatabase(db)) {
                        res.statusCode = 201;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ data: newVideo }));
                    } else {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý dữ liệu video:', error);
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
                }
            });
        }
    }
    // API images
    else if (pathname === '/api/images') {
        if (req.method === 'GET') {
            // Lấy danh sách images
            const db = readDatabase();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ data: db.images || [] }));
        } else if (req.method === 'POST') {
            // Thêm image mới
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const imageData = JSON.parse(body);
                    const db = readDatabase();
                    
                    // Đảm bảo có mảng images
                    if (!db.images) db.images = [];
                    
                    // Tạo ID mới
                    const newId = db.images.length > 0 
                        ? Math.max(...db.images.map(image => Number(image.id) || 0)) + 1 
                        : 1;
                    
                    // Tạo image mới
                    const newImage = {
                        id: newId,
                        url: imageData.url,
                        name: imageData.name,
                        description: imageData.description,
                        createdAt: new Date().toISOString()
                    };
                    
                    // Thêm vào database
                    db.images.push(newImage);
                    
                    // Lưu database
                    if (writeDatabase(db)) {
                        res.statusCode = 201;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ data: newImage }));
                    } else {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý dữ liệu image:', error);
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
                }
            });
        }
    }
    // Kiểm tra database.json
    else if (pathname === '/api/check-database') {
        try {
            // Kiểm tra database
            const db = readDatabase();
            
            // Đảm bảo có mảng videos và images
            if (!db.videos) db.videos = [];
            if (!db.images) db.images = [];
            
            // Ghi lại database để đảm bảo cấu trúc đúng
            writeDatabase(db);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
                status: 'ok',
                database: {
                    videos: db.videos.length,
                    images: db.images.length
                }
            }));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Không thể kiểm tra database' }));
        }
    }
    // API admin update database
    else if (pathname === '/api/admin/update-database') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    
                    // Kiểm tra xem có object database hay không
                    if (!data.database) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không có dữ liệu database' }));
                        return;
                    }
                    
                    // Cập nhật database
                    if (writeDatabase(data.database)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ 
                            status: 'ok',
                            message: 'Database đã được cập nhật thành công'
                        }));
                    } else {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không thể cập nhật database' }));
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý dữ liệu cập nhật database:', error);
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
                }
            });
        } else {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Phương thức không được hỗ trợ' }));
        }
    }
    // API experiences
    else if (pathname === '/api/experiences' || pathname.startsWith('/api/experiences/')) {
        // Xử lý GET request - lấy danh sách hoặc chi tiết experience
        if (req.method === 'GET') {
            const db = readDatabase();
            
            // Đảm bảo có mảng experiences
            if (!db.experiences) db.experiences = [];
            
            // Kiểm tra nếu là lấy chi tiết experience theo ID
            const match = pathname.match(/\/api\/experiences\/(\d+)/);
            if (match) {
                const id = parseInt(match[1], 10);
                const experience = db.experiences.find(exp => exp.id === id);
                
                if (experience) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ data: experience }));
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Experience không tồn tại' }));
                }
            } else {
                // Lấy danh sách experiences
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ data: db.experiences }));
            }
        }
        // Xử lý POST request - thêm experience mới hoặc cập nhật experience
        else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const db = readDatabase();
                    
                    // Đảm bảo có mảng experiences
                    if (!db.experiences) db.experiences = [];
                    
                    // Kiểm tra nếu là cập nhật experience
                    const match = pathname.match(/\/api\/experiences\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1], 10);
                        const experienceIndex = db.experiences.findIndex(exp => exp.id === id);
                        
                        if (experienceIndex !== -1) {
                            // Parse FormData (đơn giản hóa) - chỉ mô phỏng, không xử lý tệp tin
                            const formData = parseSimpleFormData(body);
                            
                            // Cập nhật experience
                            db.experiences[experienceIndex] = {
                                ...db.experiences[experienceIndex],
                                name: formData.name || db.experiences[experienceIndex].name,
                                title: formData.name || db.experiences[experienceIndex].title,
                                summary: formData.summary || db.experiences[experienceIndex].summary,
                                content: formData.content || db.experiences[experienceIndex].content,
                                child_nav_id: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : db.experiences[experienceIndex].child_nav_id,
                                updatedAt: new Date().toISOString()
                            };
                            
                            // Lưu database
                            if (writeDatabase(db)) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ data: db.experiences[experienceIndex] }));
                            } else {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                            }
                        } else {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'Experience không tồn tại' }));
                        }
                    } else {
                        // Thêm experience mới
                        // Parse FormData (đơn giản hóa) - chỉ mô phỏng, không xử lý tệp tin
                        const formData = parseSimpleFormData(body);
                        
                        // Tạo ID mới
                        const newId = db.experiences.length > 0 
                            ? Math.max(...db.experiences.map(exp => Number(exp.id) || 0)) + 1 
                            : 1;
                        
                        // Tạo experience mới
                        const newExperience = {
                            id: newId,
                            name: formData.name || '',
                            title: formData.name || '',
                            summary: formData.summary || '',
                            content: formData.content || '',
                            child_nav_id: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        // Thêm vào database
                        db.experiences.push(newExperience);
                        
                        // Lưu database
                        if (writeDatabase(db)) {
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ data: newExperience }));
                        } else {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý dữ liệu experience:', error);
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
                }
            });
        }
        // Xử lý DELETE request - xóa experience
        else if (req.method === 'DELETE') {
            // Kiểm tra nếu là xóa experience theo ID
            const match = pathname.match(/\/api\/experiences\/(\d+)/);
            if (match) {
                const id = parseInt(match[1], 10);
                const db = readDatabase();
                
                // Đảm bảo có mảng experiences
                if (!db.experiences) db.experiences = [];
                
                const experienceIndex = db.experiences.findIndex(exp => exp.id === id);
                
                if (experienceIndex !== -1) {
                    // Xóa experience
                    db.experiences.splice(experienceIndex, 1);
                    
                    // Lưu database
                    if (writeDatabase(db)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                    }
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Experience không tồn tại' }));
                }
            } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Thiếu ID experience' }));
            }
        }
    }
    // API services
    else if (pathname === '/api/services' || pathname.startsWith('/api/services/')) {
        // Xử lý GET request - lấy danh sách hoặc chi tiết service
        if (req.method === 'GET') {
            const db = readDatabase();
            
            // Đảm bảo có mảng services
            if (!db.services) db.services = [];
            
            // Kiểm tra nếu là lấy chi tiết service theo ID
            const match = pathname.match(/\/api\/services\/(\d+)/);
            if (match) {
                const id = parseInt(match[1], 10);
                const service = db.services.find(svc => svc.id === id);
                
                if (service) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ data: service }));
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Service không tồn tại' }));
                }
            } else {
                // Lấy danh sách services
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ data: db.services }));
            }
        }
        // Xử lý POST request - thêm service mới hoặc cập nhật service
        else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
                console.log('Received chunk:', chunk.toString());
            });
            
            req.on('end', () => {
                try {
                    console.log('Received complete data for service:', body.substring(0, 500));
                    console.log('Content-Type:', req.headers['content-type']);
                    
                    const db = readDatabase();
                    
                    // Đảm bảo có mảng services
                    if (!db.services) db.services = [];
                    
                    // Kiểm tra nếu là cập nhật service
                    const match = pathname.match(/\/api\/services\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1], 10);
                        const serviceIndex = db.services.findIndex(svc => svc.id === id);
                        
                        if (serviceIndex !== -1) {
                            // Parse FormData (đơn giản hóa) - chỉ mô phỏng, không xử lý tệp tin
                            const formData = parseSimpleFormData(body);
                            
                            // Cập nhật service
                            db.services[serviceIndex] = {
                                ...db.services[serviceIndex],
                                name: formData.name || db.services[serviceIndex].name,
                                slug: formData.name ? formData.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : '',
                                summary: formData.summary || db.services[serviceIndex].summary,
                                content: formData.content || db.services[serviceIndex].content,
                                description: formData.content || db.services[serviceIndex].content,
                                child_nav_id: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : db.services[serviceIndex].child_nav_id,
                                images: processImages(formData.images),
                                image: processMainImage(formData.images),
                                categoryId: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : 0,
                                isFeatured: true,
                                views: 0,
                                type: "dich-vu",
                                price: 0,
                                discountPrice: 0,
                                updatedAt: new Date().toISOString()
                            };
                            
                            // Lưu database
                            if (writeDatabase(db)) {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ data: db.services[serviceIndex] }));
                            } else {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                            }
                        } else {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'Service không tồn tại' }));
                        }
                    } else {
                        // Thêm service mới
                        // Parse FormData (đơn giản hóa) - chỉ mô phỏng, không xử lý tệp tin
                        const formData = parseSimpleFormData(body);
                        
                        // Tạo ID mới
                        const newId = db.services.length > 0 
                            ? Math.max(...db.services.map(svc => Number(svc.id) || 0)) + 1 
                            : 1;
                        
                        // Tạo service mới
                        const newService = {
                            id: newId,
                            name: formData.name || '',
                            slug: formData.name ? formData.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : '',
                            summary: formData.summary || '',
                            content: formData.content || '',
                            description: formData.content || '',
                            child_nav_id: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : 0,
                            images: processImages(formData.images),
                            image: processMainImage(formData.images),
                            categoryId: formData.child_nav_id ? parseInt(formData.child_nav_id, 10) : 0,
                            isFeatured: true,
                            views: 0,
                            type: "dich-vu",
                            price: 0,
                            discountPrice: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        // Thêm vào database
                        db.services.push(newService);
                        
                        // Lưu database
                        if (writeDatabase(db)) {
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ data: newService }));
                        } else {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý dữ liệu service:', error);
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }));
                }
            });
        }
        // Xử lý DELETE request - xóa service
        else if (req.method === 'DELETE') {
            // Kiểm tra nếu là xóa service theo ID
            const match = pathname.match(/\/api\/services\/(\d+)/);
            if (match) {
                const id = parseInt(match[1], 10);
                const db = readDatabase();
                
                // Đảm bảo có mảng services
                if (!db.services) db.services = [];
                
                const serviceIndex = db.services.findIndex(svc => svc.id === id);
                
                if (serviceIndex !== -1) {
                    // Xóa service
                    db.services.splice(serviceIndex, 1);
                    
                    // Lưu database
                    if (writeDatabase(db)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Không thể lưu database' }));
                    }
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Service không tồn tại' }));
                }
            } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Thiếu ID service' }));
            }
        }
    }
    else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API không tồn tại' }));
    }
};

// Hàm xử lý images từ formData
const processImages = (images) => {
    if (!images) return ['/images/uploads/default-image.jpg'];
    
    // Nếu là chuỗi
    if (typeof images === 'string') {
        // Nếu chuỗi bắt đầu bằng [ và kết thúc bằng ] thì có thể là chuỗi JSON
        if (images.startsWith('[') && images.endsWith(']')) {
            try {
                return JSON.parse(images);
            } catch (error) {
                console.error('Error parsing images JSON string', error);
                return [images.startsWith('/') ? images : `/images/uploads/${path.basename(images)}`];
            }
        }
        // Chuỗi thông thường
        return [images.startsWith('/') ? images : `/images/uploads/${path.basename(images)}`];
    }
    
    // Nếu đã là mảng
    if (Array.isArray(images)) {
        return images.map(img => {
            if (typeof img === 'string') {
                return img.startsWith('/') ? img : `/images/uploads/${path.basename(img)}`;
            }
            return '/images/uploads/default-image.jpg';
        });
    }
    
    // Trường hợp mặc định
    return ['/images/uploads/default-image.jpg'];
};

// Hàm lấy ảnh chính từ mảng images
const processMainImage = (images) => {
    const processedImages = processImages(images);
    return processedImages && processedImages.length > 0 ? processedImages[0] : '/images/uploads/default-image.jpg';
};

// Hàm đơn giản để phân tích chuỗi FormData
const parseSimpleFormData = (formDataStr) => {
    const result = {};
    
    try {
        // Nếu là JSON, parse trực tiếp
        if (formDataStr.trim().startsWith('{') && formDataStr.trim().endsWith('}')) {
            return JSON.parse(formDataStr);
        }
        
        // Nếu là form-data hoặc multipart/form-data từ frontend
        if (formDataStr.includes('Content-Disposition: form-data;') || 
            (formDataStr.includes('------WebKitFormBoundary') && formDataStr.includes('Content-Disposition:'))) {
            console.log("Detected multipart form data");
            
            // Tìm tất cả các phần từ boundary
            const boundaryMatch = formDataStr.match(/------[^\r\n]+/);
            if (boundaryMatch) {
                const boundary = boundaryMatch[0];
                const parts = formDataStr.split(boundary).filter(Boolean);
                
                parts.forEach(part => {
                    if (!part || part.trim() === '--') return;
                    
                    const nameMatch = part.match(/name="([^"]+)"/);
                    if (nameMatch && nameMatch[1]) {
                        const fieldName = nameMatch[1];
                        
                        // Tìm vị trí bắt đầu của giá trị
                        const headerEndPos = part.indexOf('\r\n\r\n');
                        if (headerEndPos !== -1) {
                            // Trích xuất giá trị (bỏ qua \r\n\r\n và ---)
                            let value = part.substring(headerEndPos + 4).replace(/[\r\n]*-*$/, '').trim();
                            
                            // Xử lý trường hợp đặc biệt cho images
                            if (fieldName === 'images[]' || fieldName === 'images') {
                                // Kiểm tra xem có phải là tệp tin tải lên không
                                const filenameMatch = part.match(/filename="([^"]+)"/);
                                if (filenameMatch) {
                                    const filename = filenameMatch[1];
                                    const timestamp = Date.now();
                                    const randomNum = Math.floor(Math.random() * 1000000000);
                                    const savedFilename = `${timestamp}-${randomNum}.jpg`;
                                    const filePath = path.join(__dirname, 'images', 'uploads', savedFilename);
                                    
                                    // Tạo thư mục nếu chưa có
                                    try {
                                        if (!fs.existsSync(path.join(__dirname, 'images', 'uploads'))) {
                                            fs.mkdirSync(path.join(__dirname, 'images', 'uploads'), { recursive: true });
                                        }
                                        
                                        // Tìm vị trí bắt đầu nội dung tệp tin
                                        const contentTypeMatch = part.match(/Content-Type:\s*(.+?)\r\n/);
                                        if (contentTypeMatch) {
                                            // Tìm vị trí bắt đầu của nội dung tệp tin (sau header)
                                            const fileHeaderEndPos = part.indexOf('\r\n\r\n');
                                            if (fileHeaderEndPos !== -1) {
                                                // Lấy nội dung tệp tin và loại bỏ kết thúc của phần multipart
                                                const fileContent = part.substring(fileHeaderEndPos + 4);
                                                const fileEndPos = fileContent.lastIndexOf('\r\n');
                                                const cleanFileContent = fileEndPos !== -1 ? fileContent.substring(0, fileEndPos) : fileContent;
                                                
                                                // Ghi nội dung tệp tin
                                                try {
                                                    // Sử dụng Buffer để xử lý dữ liệu nhị phân
                                                    const buffer = Buffer.from(cleanFileContent, 'binary');
                                                    fs.writeFileSync(filePath, buffer);
                                                    console.log(`File saved: ${filePath}`);
                                                    
                                                    // Đặt giá trị là đường dẫn tương đối
                                                    value = `/images/uploads/${savedFilename}`;
                                                } catch (error) {
                                                    console.error('Error saving file:', error);
                                                    value = '/images/uploads/default-image.jpg';
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error handling file upload:', error);
                                        value = '/images/uploads/default-image.jpg';
                                    }
                                }
                            }
                            
                            // Xử lý mảng
                            if (fieldName.endsWith('[]')) {
                                const actualFieldName = fieldName.slice(0, -2);
                                if (!result[actualFieldName]) {
                                    result[actualFieldName] = [];
                                }
                                result[actualFieldName].push(value);
                            } else {
                                result[fieldName] = value;
                            }
                        }
                    }
                });
            }
            
            console.log("Parsed form data:", result);
            return result;
        }
        
        // Xử lý FormData đơn giản kiểu x-www-form-urlencoded
        const parts = formDataStr.split('&');
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                result[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });
    } catch (error) {
        console.error('Error parsing form data:', error);
        console.error('Form data string:', formDataStr.substring(0, 500));
    }
    
    return result;
};

// Tạo server
const server = http.createServer((req, res) => {
    // Handle image URLs
    if (req.url.startsWith('/images/')) {
        const imagePath = req.url.replace(/^\/images\//, '');
        const imageName = path.basename(req.url);
        
        // Set CORS headers for images
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Try to serve from various locations
        const possiblePaths = [
            path.join(__dirname, 'images', imagePath),
            path.join(__dirname, 'public', 'images', imagePath),
            path.join(__dirname, 'uploads', imageName),
            path.join(__dirname, 'public', 'images', 'uploads', imageName),
            path.join(__dirname, 'images', 'uploads', imageName),
            path.join(__dirname, 'phunongbuondon-api', 'images', imagePath)
        ];
        
        for (const filePath of possiblePaths) {
            if (serveStaticFile(req, res, filePath)) {
                return; // Successfully served the file
            }
        }
        
        // If image not found, try serving a default image
        const defaultImagePath = path.join(__dirname, 'public', 'images', 'default-image.jpg');
        if (serveStaticFile(req, res, defaultImagePath)) {
            return;
        }
        
        // Last resort - return a 404
        res.statusCode = 404;
        res.end('Image not found');
        return;
    }
    
    // Chỉ xử lý các request API
    if (req.url.startsWith('/api/')) {
        handleApiRequest(req, res);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

// Đảm bảo database.json có cấu trúc đúng khi khởi động
try {
    const db = readDatabase();
    if (!db.videos) db.videos = [];
    if (!db.images) db.images = [];
    if (!db.experiences) db.experiences = [];
    if (!db.services) db.services = [];
    writeDatabase(db);
    console.log('Database đã được chuẩn bị');
} catch (error) {
    console.error('Lỗi khi chuẩn bị database:', error);
}

// Khởi động server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`API videos: http://localhost:${PORT}/api/videos`);
    console.log(`API images: http://localhost:${PORT}/api/images`);
}); 