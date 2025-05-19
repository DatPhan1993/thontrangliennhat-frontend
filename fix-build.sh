#!/bin/bash

# This script helps fix build issues on Vercel and other platforms
# It handles EACCES permissions and NODE_OPTIONS for OpenSSL

echo "Running post-build fixes..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Create public directories if they don't exist
mkdir -p public/phunongbuondon-api
mkdir -p build/phunongbuondon-api

# Copy database.json to public and build
cp -f database.json public/phunongbuondon-api/database.json
cp -f database.json build/phunongbuondon-api/database.json

# Create a public images folder structure (if not exists)
mkdir -p public/images/experiences
mkdir -p build/images/experiences

# Copy all node_modules CSS that might be missing
echo "Ensuring all CSS dependencies are properly included..."

# Fix for Swiper CSS
if [ -d "node_modules/swiper/swiper.min.css" ]; then
  cp -r node_modules/swiper/swiper.min.css build/static/css/
fi

if [ -d "node_modules/swiper/modules" ]; then
  mkdir -p build/static/css/swiper
  cp -r node_modules/swiper/modules/*.css build/static/css/swiper/
fi

# Fix potential permissions issues
chmod -R 755 node_modules/.bin

# Ensure environment variables are set
export NODE_ENV=production
export CI=false

# Add OpenSSL legacy provider for older Node.js versions
export NODE_OPTIONS=--openssl-legacy-provider

# Remove potentially problematic modules
if [ -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
  rm -rf node_modules/@rollup/rollup-linux-x64-gnu
fi

# Run the actual build
npx craco build

# Run post-build tasks
node copy-database.js

echo "Post-build fixes completed successfully!"
echo "Build completed successfully!" 