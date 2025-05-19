#!/bin/bash

# Create static site for Vercel
echo "Creating Vercel deployment..."

# Set environment variables
export NODE_OPTIONS=--openssl-legacy-provider
export CI=false
export NODE_ENV=production
export PUBLIC_URL="/"

# Clean previous build
rm -rf build .vercel/output

# Build the project
npm run build

# Verify the build directory exists
if [ ! -d "build" ]; then
  echo "Build failed: no build directory found"
  exit 1
fi

# Ensure manifest.json is valid
echo "Validating manifest.json..."
cat build/manifest.json | jq . > /dev/null
if [ $? -ne 0 ]; then
  echo "manifest.json is not valid JSON. Fixing..."
  cat > build/manifest.json << EOL
{
  "short_name": "Thôn Trang Liên Nhật",
  "name": "Trang web Thôn Trang Liên Nhật",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOL
  echo "manifest.json fixed."
fi

# Create .vercel/output structure
mkdir -p .vercel/output/static
cp -r build/* .vercel/output/static/

# Create config.json file for Vercel
cat > .vercel/output/config.json << EOL
{
  "version": 3,
  "routes": [
    {
      "handle": "filesystem"
    },
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