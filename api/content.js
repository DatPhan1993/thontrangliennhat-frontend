// API endpoint for experiences content
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
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log for debugging
  console.log(`Content API: ${req.method} ${req.url}`);
  
  try {
    const db = readDatabase();
    
    // Parse URL path to determine what content to serve
    const urlPath = req.url || '';
    const pathParts = urlPath.split('/').filter(Boolean);
    
    // Check if we're requesting an experience by ID
    if (pathParts.length > 0 && !isNaN(pathParts[0])) {
      const experienceId = parseInt(pathParts[0], 10);
      const experience = db.experiences?.find(exp => exp.id === experienceId) || null;
      
      if (experience) {
        return res.status(200).json({ data: experience });
      } else {
        return res.status(404).json({ error: 'Experience not found' });
      }
    }
    
    // Default: return all experiences
    const experiences = db.experiences || [];
    return res.status(200).json({ data: experiences });
  } catch (error) {
    console.error('Error serving content:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 