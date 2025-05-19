#!/bin/bash

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

echo "Post-build fixes completed successfully!" 