// This file serves as the main API entry point for Vercel serverless functions
const fs = require('fs');
const path = require('path');

// Get the path to the database file relative to the serverless function
const getDbPath = () => {
  const rootDir = path.resolve('./');
  return path.join(rootDir, 'database.json');
};

// Read database
const readDatabase = () => {
  try {
    const dbPath = getDbPath();
    console.log(`Reading database from: ${dbPath}`);
    
    if (!fs.existsSync(dbPath)) {
      console.log('Database file not found, returning empty database');
      return { videos: [], images: [], experiences: [], services: [] };
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { videos: [], images: [], experiences: [], services: [] };
  }
};

// Handle API requests
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log request for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  
  try {
    // Read database to serve data
    const db = readDatabase();
    
    // Simple routing based on path
    const path = req.url.split('?')[0]; // Remove query parameters
    
    if (path === '/api' || path === '/') {
      return res.status(200).json({ message: 'API is working' });
    }
    
    // Videos endpoints
    else if (path === '/api/videos') {
      return res.status(200).json({ data: db.videos || [] });
    }
    
    // Images endpoints
    else if (path === '/api/images') {
      return res.status(200).json({ data: db.images || [] });
    }
    
    // Experiences endpoints
    else if (path === '/api/experiences') {
      return res.status(200).json({ data: db.experiences || [] });
    }
    
    // Services endpoints
    else if (path === '/api/services') {
      return res.status(200).json({ data: db.services || [] });
    }
    
    // Database endpoint (for direct access)
    else if (path === '/api/database') {
      return res.status(200).json(db);
    }
    
    // Fallback for unknown endpoints
    else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 