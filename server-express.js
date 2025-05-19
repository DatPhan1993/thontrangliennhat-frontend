// POST endpoint for updating a product
app.post('/api/products/:id', upload.array('images[]', 5), (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    console.log(`POST /api/products/${productId} - Updating product:`, req.body);
    
    // Read the database
    const db = getDatabase();
    
    // Find the product by ID
    const productIndex = db.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found'
      });
    }
    
    // Get the current product data
    const currentProduct = db.products[productIndex];
    console.log('Current product data:', currentProduct);
    
    // Extract data from request body
    const { 
      name, 
      content, 
      child_nav_id, 
      summary, 
      features,
      phone_number
    } = req.body;
    
    // Get uploaded files info
    const uploadedFiles = req.files || [];
    // Lưu vào thư mục uploads thay vì products
    const newFileUrls = uploadedFiles.map(file => `/images/uploads/${file.filename}`);
    console.log('New file URLs:', newFileUrls);
    
    // Handle existing images in form data
    let existingImages = [];
    if (req.body['images[]']) {
      if (Array.isArray(req.body['images[]'])) {
        existingImages = req.body['images[]'];
      } else {
        existingImages = [req.body['images[]']];
      }
      console.log('Existing images from form:', existingImages);
    }
    
    // Determine what images to save
    let finalImages;
    
    if (existingImages.length > 0 || newFileUrls.length > 0) {
      // If we have either existing or new images, combine them
      finalImages = [...existingImages, ...newFileUrls];
      console.log('Combined images:', finalImages);
    } else if (currentProduct.images) {
      // If no new images but product has existing images, keep them
      if (Array.isArray(currentProduct.images)) {
        finalImages = [...currentProduct.images];
      } else {
        finalImages = [currentProduct.images];
      }
      console.log('Keeping current product images:', finalImages);
    } else {
      // Default to empty array if no images anywhere
      finalImages = [];
      console.log('No images found, using empty array');
    }
    
    // Chuyển đổi đường dẫn products sang uploads nếu có
    finalImages = finalImages.map(img => {
      if (typeof img === 'string' && img.includes('/images/products/')) {
        return img.replace('/images/products/', '/images/uploads/');
      }
      return img;
    });
    console.log('Final images after path conversion:', finalImages);
    
    // For consistent representation in database, 
    // if only one image, store as string, otherwise as array
    const imagesToStore = finalImages.length === 1 ? finalImages[0] : finalImages;
    console.log('Images to store in DB:', imagesToStore);
    
    // Create updated product object - preserve all original fields
    const updatedProduct = {
      ...currentProduct,
      id: productId, // Ensure ID is preserved
      name: name || currentProduct.name,
      content: content || currentProduct.content,
      description: content || currentProduct.description, // Update description to match content
      summary: summary || currentProduct.summary,
      child_nav_id: child_nav_id ? parseInt(child_nav_id) : currentProduct.child_nav_id,
      categoryId: child_nav_id ? parseInt(child_nav_id) : currentProduct.categoryId, // Update categoryId to match child_nav_id
      features: features || currentProduct.features,
      phone_number: phone_number || currentProduct.phone_number,
      slug: currentProduct.slug, // Ensure slug is preserved
      type: currentProduct.type || "san-pham", // Ensure type is preserved
      price: currentProduct.price, // Preserve price
      discountPrice: currentProduct.discountPrice, // Preserve discount price
      isFeatured: currentProduct.isFeatured, // Preserve featured status
      views: currentProduct.views, // Preserve view count
      createdAt: currentProduct.createdAt, // Preserve created date
      updatedAt: new Date().toISOString(), // Update modified date
      images: imagesToStore // Use our processed images
    };
    
    console.log('Final updated product data:', updatedProduct);
    
    // Update the product in the database
    db.products[productIndex] = updatedProduct;
    
    // Save the database
    if (writeDatabase(db)) {
      // Add cache control headers to ensure browsers get fresh data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      return res.status(200).json({
        statusCode: 200,
        message: 'Product updated successfully',
        data: updatedProduct,
        timestamp: Date.now() // Add timestamp to force client to see it as new data
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: 'Error writing to database'
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
});

// API endpoint cho products
app.get('/api/products', (req, res) => {
  try {
    console.log('GET /api/products - Fetching all products');
    
    const db = getDatabase();
    
    // Add cache control headers to ensure browsers get fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: db.products,
      timestamp: Date.now() // Add timestamp to force client to see it as new data
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error fetching products: ' + error.message
    });
  }
});

// API endpoint để lấy chi tiết sản phẩm theo ID
app.get('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`GET /api/products/${id} - Fetching product`);
    
    const db = getDatabase();
    
    const product = db.products.find(p => p.id === id);
    
    // Add cache control headers to ensure browsers get fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    if (product) {
      res.json({
        statusCode: 200,
        message: 'Success',
        data: product,
        timestamp: Date.now() // Add timestamp to force client to see it as new data
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error fetching product: ' + error.message
    });
  }
});

// Add these static file mappings to the top of your server file before your routes
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Serve static files from all possible directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images/uploads', express.static(path.join(__dirname, 'images', 'uploads')));
app.use('/images/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images/uploads', express.static(path.join(__dirname, 'public', 'images', 'uploads')));
app.use('/images/products', express.static(path.join(__dirname, 'images', 'products')));
app.use('/images/products', express.static(path.join(__dirname, 'public', 'images', 'products')));

// Also serve files from the phunongbuondon-api directory
app.use('/images/uploads', express.static(path.join(__dirname, 'phunongbuondon-api', 'images', 'uploads')));

// Add direct route handler for connection timed out image URLs
app.get('/images/uploads/1747193559802-784322977.jpg', (req, res) => {
  const imagePaths = [
    path.join(__dirname, 'uploads', '1747193559802-784322977.jpg'),
    path.join(__dirname, 'phunongbuondon-api', 'images', 'uploads', '1747193559802-784322977.jpg'),
    path.join(__dirname, 'public', 'images', 'uploads', '1747193559802-784322977.jpg'),
    path.join(__dirname, 'images', 'uploads', '1747193559802-784322977.jpg')
  ];
  
  for (const imagePath of imagePaths) {
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    }
  }
  
  // Fallback to default image if not found
  res.sendFile(path.join(__dirname, 'public', 'images', 'default-image.jpg'));
});

app.get('/images/uploads/1747213249793-521951070.jpg', (req, res) => {
  const imagePaths = [
    path.join(__dirname, 'uploads', '1747213249793-521951070.jpg'),
    path.join(__dirname, 'phunongbuondon-api', 'images', 'uploads', '1747213249793-521951070.jpg'),
    path.join(__dirname, 'public', 'images', 'uploads', '1747213249793-521951070.jpg'),
    path.join(__dirname, 'images', 'uploads', '1747213249793-521951070.jpg')
  ];
  
  for (const imagePath of imagePaths) {
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    }
  }
  
  // Fallback to default image if not found
  res.sendFile(path.join(__dirname, 'public', 'images', 'default-image.jpg'));
}); 