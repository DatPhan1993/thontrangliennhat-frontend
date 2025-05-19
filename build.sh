#!/bin/bash

# Create static site for Vercel
echo "Creating Vercel deployment..."

# Set environment variables
export NODE_OPTIONS=--openssl-legacy-provider
export CI=false
export NODE_ENV=production

# Build the project
npm run build

# Copy to expected output folder for Vercel
mkdir -p .vercel/output/static
cp -r build/* .vercel/output/static/

# Create config.json file for Vercel
cat > .vercel/output/config.json << EOL
{
  "version": 3,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.thontrangliennhat.com/api/$1"
    },
    {
      "src": "/phunongbuondon-api/database.json",
      "dest": "https://api.thontrangliennhat.com/phunongbuondon-api/database.json"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "https://api.thontrangliennhat.com/uploads/$1"
    },
    {
      "src": "/images/(.*)",
      "dest": "https://api.thontrangliennhat.com/images/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOL

echo "Vercel deployment files created successfully." 