#!/usr/bin/env node

/**
 * Script đồng bộ hoá các file database.json
 * Chạy script này sau khi thêm, sửa, xoá dữ liệu để đảm bảo các file database.json được đồng bộ
 */

const fs = require('fs');
const path = require('path');

// Đường dẫn đến các file database
const API_DB_PATH = path.join(__dirname, 'phunongbuondon-api', 'database.json');
const ROOT_DB_PATH = path.join(__dirname, 'database.json');
const PUBLIC_DB_PATH = path.join(__dirname, 'public', 'phunongbuondon-api', 'database.json');
const BUILD_DB_PATH = path.join(__dirname, 'build', 'phunongbuondon-api', 'database.json');

console.log('=== Đồng bộ hoá cơ sở dữ liệu PHUNONG BUONDON ===');
console.log('Đường dẫn đến các file cần đồng bộ:');
console.log('- API:    ' + API_DB_PATH);
console.log('- ROOT:   ' + ROOT_DB_PATH);
console.log('- PUBLIC: ' + PUBLIC_DB_PATH);
console.log('- BUILD:  ' + BUILD_DB_PATH);

// Tạo thư mục nếu chưa tồn tại
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    console.log(`Đã tạo thư mục: ${dirname}`);
  }
}

// Kiểm tra file database nào tồn tại để lấy làm nguồn
function checkDatabase() {
  // Ưu tiên thứ tự: API > ROOT > PUBLIC > BUILD
  if (fs.existsSync(API_DB_PATH)) {
    console.log('Sử dụng file nguồn từ API server');
    return API_DB_PATH;
  }
  
  if (fs.existsSync(ROOT_DB_PATH)) {
    console.log('Sử dụng file nguồn từ thư mục gốc');
    return ROOT_DB_PATH;
  }
  
  if (fs.existsSync(PUBLIC_DB_PATH)) {
    console.log('Sử dụng file nguồn từ thư mục public');
    return PUBLIC_DB_PATH;
  }
  
  if (fs.existsSync(BUILD_DB_PATH)) {
    console.log('Sử dụng file nguồn từ thư mục build');
    return BUILD_DB_PATH;
  }
  
  console.error('CẢNH BÁO: Không tìm thấy file database.json trong hệ thống!');
  return null;
}

// Đồng bộ database
function syncDatabases() {
  try {
    console.log('Bắt đầu đồng bộ cơ sở dữ liệu...');
    
    const sourcePath = checkDatabase();
    if (!sourcePath) {
      console.error('Không có file nguồn để đồng bộ!');
      return false;
    }
    
    // Đọc nội dung từ file nguồn
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    let database;
    
    try {
      database = JSON.parse(sourceContent);
      console.log(`Đã đọc database với ${database.experiences?.length || 0} trải nghiệm`);
    } catch (parseError) {
      console.error('Lỗi khi phân tích file database:', parseError);
      return false;
    }
    
    // Chuẩn hoá định dạng trường images của experience
    if (database.experiences && Array.isArray(database.experiences)) {
      let needStandardization = false;
      
      database.experiences = database.experiences.map(exp => {
        if (exp.images) {
          // Nếu images là chuỗi, chuyển thành mảng
          if (typeof exp.images === 'string') {
            exp.images = [exp.images];
            needStandardization = true;
          }
        } else {
          // Nếu không có images, khởi tạo mảng rỗng
          exp.images = [];
          needStandardization = true;
        }
        return exp;
      });
      
      if (needStandardization) {
        console.log('Đã chuẩn hoá định dạng images của experience');
      }
    }
    
    // Đảm bảo các thư mục tồn tại
    ensureDirectoryExists(API_DB_PATH);
    ensureDirectoryExists(PUBLIC_DB_PATH);
    ensureDirectoryExists(BUILD_DB_PATH);
    
    // Ghi dữ liệu vào tất cả các file
    const targetPaths = [API_DB_PATH, ROOT_DB_PATH, PUBLIC_DB_PATH];
    if (fs.existsSync(path.dirname(BUILD_DB_PATH))) {
      targetPaths.push(BUILD_DB_PATH);
    }
    
    targetPaths.forEach(dbPath => {
      try {
        // Thêm timestamp để đảm bảo dữ liệu mới nhất
        const timestamp = new Date().toISOString();
        database._lastSync = timestamp;
        
        // Tạo backup trước khi ghi đè
        if (fs.existsSync(dbPath)) {
          const backupPath = `${dbPath}.backup`;
          fs.copyFileSync(dbPath, backupPath);
          console.log(`Đã sao lưu file ${dbPath} vào ${backupPath}`);
        }
        
        // Ghi file với quyền truy cập đầy đủ
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
        try {
          fs.chmodSync(dbPath, 0o666);
        } catch (chmodError) {
          console.warn(`Không thể thay đổi quyền truy cập cho file ${dbPath}:`, chmodError);
        }
        
        console.log(`✅ Đã cập nhật ${dbPath}`);
      } catch (writeError) {
        console.error(`❌ Lỗi khi ghi vào ${dbPath}:`, writeError);
      }
    });
    
    console.log('🎉 Hoàn tất đồng bộ cơ sở dữ liệu!');
    console.log(`📊 Tổng số trải nghiệm: ${database.experiences?.length || 0}`);
    return true;
  } catch (error) {
    console.error('Lỗi trong quá trình đồng bộ:', error);
    return false;
  }
}

// Thực thi đồng bộ
const result = syncDatabases();
process.exit(result ? 0 : 1); 