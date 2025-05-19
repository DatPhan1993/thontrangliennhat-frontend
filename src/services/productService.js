import httpRequest from '~/utils/httpRequest';
import axios from 'axios';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

const getFromSessionStorage = (key) => {
    const storedData = sessionStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
};

// Get all products and cache them in sessionStorage
export const getProducts = async () => {
    const sessionKey = 'allProducts';

    // Always fetch fresh data
    try {
        console.log('Fetching fresh product data from API...');
        
        // Force cache invalidation
        const response = await httpRequest.get('/products', {
            params: {
                _: Date.now(),
                forceRefresh: true
            },
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        const products = response.data.data;
        console.log(`[productService] Received ${products.length} products from API`);

        // Chuẩn hóa trường images thành mảng
        const normalizedProducts = products.map(product => {
            if (!product) {
                console.log('[productService] Found null/undefined product, returning empty object');
                return { images: [] };
            }
            
            // Deep clone the product to avoid reference issues
            const processedProduct = { ...product };
            
            // Log the original images value for debugging
            console.log(`[productService] Product ${product.id} - ${product.name} original images:`, product.images);
            
            // Handle string images (single image as string)
            if (typeof product.images === 'string' && product.images.trim() !== '') {
                console.log(`[productService] Product ${product.id} has string image, converting to array:`, product.images);
                processedProduct.images = [product.images];
            } 
            // Handle null, undefined or empty string
            else if (!product.images || (typeof product.images === 'string' && product.images.trim() === '')) {
                console.log(`[productService] Product ${product.id} has no/empty images, setting empty array`);
                processedProduct.images = [];
            }
            // Handle empty array
            else if (Array.isArray(product.images) && product.images.length === 0) {
                console.log(`[productService] Product ${product.id} has empty images array`);
                processedProduct.images = [];
            }
            // Handle array with empty string values
            else if (Array.isArray(product.images)) {
                const filteredImages = product.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                console.log(`[productService] Product ${product.id} has array images, filtered from ${product.images.length} to ${filteredImages.length} images`);
                processedProduct.images = filteredImages;
            }
            // Handle any other case
            else {
                console.log(`[productService] Product ${product.id} has unknown images format:`, typeof product.images);
                processedProduct.images = [];
            }
            
            // Final verification to ensure images is always an array
            if (!Array.isArray(processedProduct.images)) {
                console.warn(`[productService] Images still not an array after processing for product ${product.id}, forcing empty array`);
                processedProduct.images = [];
            }
            
            console.log(`[productService] Product ${product.id} final processed images:`, processedProduct.images);
            return processedProduct;
        });

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, normalizedProducts);
        console.log(`Cached ${normalizedProducts.length} products in sessionStorage`);

        return normalizedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        
        // If API call fails, try to use cached data as fallback
        const cachedData = getFromSessionStorage(sessionKey);
        if (cachedData) {
            console.log('Using cached product data as fallback after API error');
            return cachedData;
        }
        
        throw error;
    }
};

// Get products with pagination and cache them in sessionStorage
export const getProductsPagination = async ($page = 1, $limit = 8) => {
    const sessionKey = `products_page_${$page}_limit_${$limit}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/products?page=${$page}&limit=${$limit}`);
        const products = response.data.data;

        // Chuẩn hóa trường images thành mảng
        const normalizedProducts = products.map(product => {
            if (!product) return { images: [] };
            
            // Handle string images (single image as string)
            if (typeof product.images === 'string' && product.images.trim() !== '') {
                return { ...product, images: [product.images] };
            } 
            // Handle null, undefined or empty string
            else if (!product.images || (typeof product.images === 'string' && product.images.trim() === '')) {
                return { ...product, images: [] };
            }
            // Handle empty array
            else if (Array.isArray(product.images) && product.images.length === 0) {
                return { ...product, images: [] };
            }
            // Handle array with empty string values
            else if (Array.isArray(product.images)) {
                return { 
                    ...product, 
                    images: product.images.filter(img => img && img.trim && img.trim() !== '') 
                };
            }
            
            return product;
        });

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, normalizedProducts);

        return normalizedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get product by ID and cache the result
export const getProductById = async (id) => {
    const sessionKey = `product_${id}`;

    // Always fetch fresh data
    try {
        console.log(`Fetching fresh data for product ID ${id}...`);
        
        // Force cache invalidation
        const response = await httpRequest.get(`/products/${id}`, {
            params: {
                _: Date.now(),
                forceRefresh: true
            },
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        const product = response.data.data;

        // Chuẩn hóa trường images thành mảng
        if (!product) {
            let productObj = { images: [] };
            product = productObj;
        }

        if (typeof product.images === 'string' && product.images.trim() !== '') {
            product.images = [product.images];
        } 
        else if (!product.images || (typeof product.images === 'string' && product.images.trim() === '')) {
            product.images = [];
        }
        else if (Array.isArray(product.images) && product.images.length === 0) {
            product.images = [];
        }
        else if (Array.isArray(product.images)) {
            product.images = product.images.filter(img => img && img.trim && img.trim() !== '');
        }

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, product);
        console.log(`Cached product ${id} in sessionStorage`);

        return product;
    } catch (error) {
        console.error(`Error fetching product detail with id ${id}:`, error);
        
        // If API call fails, try to use cached data as fallback
        const cachedData = getFromSessionStorage(sessionKey);
        if (cachedData) {
            console.log(`Using cached data for product ${id} as fallback after API error`);
            return cachedData;
        }
        
        throw error;
    }
};

// Get products by category and cache them
export const getProductsByCategory = async (categoryId) => {
    const sessionKey = `products_category_${categoryId}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/products?child_nav_id=${categoryId}`);
        const products = response.data.data;

        // Chuẩn hóa trường images thành mảng
        const normalizedProducts = products.map(product => {
            if (!product) return { images: [] };
            
            // Handle string images (single image as string)
            if (typeof product.images === 'string' && product.images.trim() !== '') {
                return { ...product, images: [product.images] };
            } 
            // Handle null, undefined or empty string
            else if (!product.images || (typeof product.images === 'string' && product.images.trim() === '')) {
                return { ...product, images: [] };
            }
            // Handle empty array
            else if (Array.isArray(product.images) && product.images.length === 0) {
                return { ...product, images: [] };
            }
            // Handle array with empty string values
            else if (Array.isArray(product.images)) {
                return { 
                    ...product, 
                    images: product.images.filter(img => img && img.trim && img.trim() !== '') 
                };
            }
            
            return product;
        });

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, normalizedProducts);

        return normalizedProducts;
    } catch (error) {
        console.error(`Error fetching products for child nav id=${categoryId}:`, error);
        throw error;
    }
};

// Get product by slug and cache it
export const getProductBySlug = async (slug) => {
    const sessionKey = `product_slug_${slug}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/products/slug/${slug}`);
        const product = response.data.data;

        // Chuẩn hóa trường images thành mảng
        if (!product) {
            let productObj = { images: [] };
            product = productObj;
        }

        if (typeof product.images === 'string' && product.images.trim() !== '') {
            product.images = [product.images];
        } 
        else if (!product.images || (typeof product.images === 'string' && product.images.trim() === '')) {
            product.images = [];
        }
        else if (Array.isArray(product.images) && product.images.length === 0) {
            product.images = [];
        }
        else if (Array.isArray(product.images)) {
            product.images = product.images.filter(img => img && img.trim && img.trim() !== '');
        }

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, product);

        return product;
    } catch (error) {
        console.error(`Error fetching products with slug ${slug}:`, error);
        throw error;
    }
};

// Create a product (no sessionStorage needed for POST requests)
export const createProduct = async (productData) => {
    try {
        console.log('Creating product with FormData');
        
        // Kiểm tra dữ liệu trước khi gửi
        if (productData instanceof FormData) {
            // Log các giá trị để debug
            console.log('FormData content:');
            for (let [key, value] of productData.entries()) {
                console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`);
            }
        }
        
        // Đường dẫn API đầy đủ
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        console.log(`Using API URL: ${apiUrl}/products`);
        
        // Tạo request sử dụng XMLHttpRequest để hỗ trợ FormData tốt hơn
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${apiUrl}/products`, true);
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Xử lý kết quả thành công
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log('Success response:', data);
                        
                        // Xóa cache
                        sessionStorage.removeItem('allProducts');
                        
                        // Trả về dữ liệu
                        resolve(data.data);
                    } catch (error) {
                        console.error('Error parsing response:', error);
                        reject(new Error('Invalid response from server'));
                    }
                } else {
                    // Xử lý lỗi
                    console.error('Server error:', xhr.status, xhr.responseText);
                    
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.message || 'Server error'));
                    } catch (e) {
                        reject(new Error(`Server error: ${xhr.status}`));
                    }
                }
            };
            
            xhr.onerror = function() {
                console.error('Network error occurred');
                reject(new Error('Network error occurred. Please check your connection.'));
            };
            
            // Gửi form data
            xhr.send(productData);
        });
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// Update a product and refresh sessionStorage for that product
export const updateProduct = async (id, productData) => {
    try {
        console.log(`Updating product with ID: ${id}`);
        
        // For direct debugging - log form data contents
        if (productData instanceof FormData) {
            console.log("FormData contents:");
            for (let [key, value] of productData.entries()) {
                console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
            }
        }
        
        // Create a custom axios request for more control
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        console.log(`Using API URL: ${apiUrl}/products/${id}`);
        
        const response = await axios({
            method: 'post',
            url: `${apiUrl}/products/${id}`,
            data: productData,
            headers: {
                // Don't set Content-Type for FormData - let browser handle it
                // 'Content-Type': 'multipart/form-data', 
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            // Ensure credentials are included (for CORS)
            withCredentials: false
        });
        
        // Log response
        console.log("API response:", response.status, response.statusText);
        
        // Clear cached data
        sessionStorage.removeItem('allProducts');
        sessionStorage.removeItem(`product_${id}`);
        
        // Clear any pagination-related cached data
        for (let key of Object.keys(sessionStorage)) {
            if (key.startsWith('products_page_')) {
                sessionStorage.removeItem(key);
            }
        }
        
        console.log(`Product updated successfully`, response.data);
        
        try {
            // Try to update sessionStorage with the new product data
            const updatedProducts = await getProducts();
            saveToSessionStorage('allProducts', updatedProducts);
            saveToSessionStorage(`product_${id}`, response.data.data);
        } catch (error) {
            console.warn('Failed to update cache after product update:', error);
            // Continue since the update was successful
        }
        
        return response.data.data;
    } catch (error) {
        console.error(`Error updating product with id ${id}:`, error);
        
        // Log more detailed error information
        if (error.response) {
            console.error('Server error response:', 
                error.response.status, 
                error.response.statusText,
                error.response.data
            );
        } else if (error.request) {
            console.error('No response received from API:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        
        throw error;
    }
};

// Delete a product and remove it from sessionStorage
export const deleteProduct = async (id) => {
    try {
        const response = await httpRequest.delete(`/products/${id}`);

        // Remove the deleted product from sessionStorage
        sessionStorage.removeItem(`product_${id}`);
        sessionStorage.removeItem('allProducts');

        const updateProduct = await getProducts();
        saveToSessionStorage('allProducts', updateProduct);

        return response.data.data;
    } catch (error) {
        console.error(`Error deleting product with id ${id}:`, error);
        throw error;
    }
};
