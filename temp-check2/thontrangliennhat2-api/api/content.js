/**
 * Content API handler for products, services, experiences, and news
 */
const fs = require('fs');
const path = require('path');
const corsMiddleware = require('./cors-middleware');

// Helper function to read the database
function readDatabase() {
  try {
    const dbPath = path.join(__dirname, '../database.json');
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
    return { experiences: [], products: [], services: [], news: [] };
  } catch (error) {
    console.error('Error reading database:', error);
    return { experiences: [], products: [], services: [], news: [] };
  }
}

// Handle all content-related requests
module.exports = (req, res) => {
  // Apply CORS middleware
  corsMiddleware(req, res);
  
  // Get the URL path to determine which content type is being requested
  const { url } = req;
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Determine content type from URL
  let contentType = 'unknown';
  if (url.includes('/experiences')) {
    contentType = 'experiences';
  } else if (url.includes('/products')) {
    contentType = 'products';
  } else if (url.includes('/services')) {
    contentType = 'services';
  } else if (url.includes('/news')) {
    contentType = 'news';
  }
  
  // Read database
  const db = readDatabase();
  const items = db[contentType] || [];
  
  // Handle special routes
  if (url.includes('/featured')) {
    // Handle featured items request
    const limit = parseInt(req.query.limit) || 6;
    
    // Get featured items, or if none specifically marked, get the newest ones
    let featuredItems = items.filter(item => item.isFeatured);
    
    // If no items marked as featured, use the newest ones
    if (featuredItems.length === 0) {
      featuredItems = [...items].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA;
      });
    }
    
    // Limit to requested number
    featuredItems = featuredItems.slice(0, limit);
    
    return res.json({
      success: true,
      data: featuredItems,
      timestamp: Date.now()
    });
  } 
  
  // Handle specific item request with ID
  const idMatch = url.match(/\/(\d+)$/);
  if (idMatch) {
    const id = parseInt(idMatch[1]);
    const item = items.find(item => parseInt(item.id) === id);
    
    if (item) {
      return res.json({
        success: true,
        data: item,
        timestamp: Date.now()
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `${contentType.slice(0, -1)} with ID ${id} not found`,
        timestamp: Date.now()
      });
    }
  }
  
  // Handle category filter
  const categoryMatch = url.match(/\/category\/(\d+)$/);
  if (categoryMatch) {
    const categoryId = parseInt(categoryMatch[1]);
    const filteredItems = items.filter(item => 
      parseInt(item.categoryId || item.child_nav_id) === categoryId
    );
    
    return res.json({
      success: true,
      data: filteredItems,
      timestamp: Date.now()
    });
  }
  
  // Default: return all items of the content type
  return res.json({
    success: true,
    data: items,
    timestamp: Date.now()
  });
}; 