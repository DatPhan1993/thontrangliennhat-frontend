// This script copies the database.json file to the build directory
// for use with Vercel serverless functions
const fs = require('fs');
const path = require('path');

console.log('Running post-build database copy...');

// Paths
const sourceDbPath = path.join(__dirname, 'database.json');
const buildDir = path.join(__dirname, 'build');
const apiDir = path.join(buildDir, 'phunongbuondon-api');
const targetDbPath = path.join(apiDir, 'database.json');

// Create directories if they don't exist
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

if (!fs.existsSync(apiDir)) {
  console.log('Creating API directory...');
  fs.mkdirSync(apiDir, { recursive: true });
}

// Copy database.json
try {
  if (fs.existsSync(sourceDbPath)) {
    console.log(`Copying database from ${sourceDbPath} to ${targetDbPath}...`);
    fs.copyFileSync(sourceDbPath, targetDbPath);
    console.log('Database copied successfully!');
  } else {
    console.error('Source database.json not found!');
    
    // Create empty database
    console.log('Creating empty database structure...');
    const emptyDb = {
      videos: [],
      images: [],
      experiences: [],
      services: [],
      products: []
    };
    
    fs.writeFileSync(targetDbPath, JSON.stringify(emptyDb, null, 2));
    console.log('Empty database created successfully!');
  }
} catch (error) {
  console.error('Error copying database:', error);
  process.exit(1);
}

console.log('Post-build tasks completed successfully!'); 