// API endpoint to serve database.json content
const fs = require('fs');
const path = require('path');

// Get the path to the database file
const getDbPath = () => {
  const rootDir = path.resolve('./');
  return path.join(rootDir, 'database.json');
};

// Read database
const readDatabase = () => {
  try {
    const dbPath = getDbPath();
    
    if (!fs.existsSync(dbPath)) {
      return { videos: [], images: [], experiences: [], services: [] };
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { videos: [], images: [], experiences: [], services: [] };
  }
};

module.exports = (req, res) => {
  // Set CORS headers to allow access from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const db = readDatabase();
    return res.status(200).json(db);
  } catch (error) {
    console.error('Error serving database:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 