// API endpoint for experiences
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
      return { experiences: [] };
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { experiences: [] };
  }
};

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log for debugging
  console.log(`Experiences API: ${req.method} ${req.url}`);
  
  try {
    const db = readDatabase();
    const experiences = db.experiences || [];
    
    // Return all experiences
    return res.status(200).json({ data: experiences });
  } catch (error) {
    console.error('Error serving experiences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 