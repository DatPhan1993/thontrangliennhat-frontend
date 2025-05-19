import axios from 'axios';

// Set base URL to thontrangliennhat.com for all environments
const baseURL = 'https://thontrangliennhat.com/api';

console.log('Using API baseURL:', baseURL);

// Clear any session storage on startup to ensure fresh data
try {
    // Clear any stored product data
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('product_') || key === 'allProducts' || key.startsWith('products_')) {
            console.log('Clearing cached data for key:', key);
            sessionStorage.removeItem(key);
        }
    });
} catch (e) {
    console.warn('Error clearing sessionStorage:', e);
}

const instance = axios.create({
    baseURL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Add a timestamp to ALL requests to prevent caching
instance.interceptors.request.use(config => {
    // Add cache busting parameter to all requests
    const timestamp = Date.now();
    
    // For GET requests, add to query params
    if (config.method === 'get') {
        config.params = config.params || {};
        config.params._ = timestamp;
        config.params.nocache = timestamp;
    }
    
    // For all requests, add to headers
    config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Timestamp': timestamp.toString()
    };
    
    // Handle FormData correctly
    if (config.data instanceof FormData) {
        // Log what we're sending for debugging
        console.log(`Sending FormData with ${Array.from(config.data.keys()).length} keys`);
        
        // Very important: Remove Content-Type header completely for FormData
        // This allows the browser to set the proper boundary
        delete config.headers['Content-Type'];
        
        // Add debug information
        if (process.env.NODE_ENV === 'development') {
            console.log('FormData keys:', Array.from(config.data.keys()));
            for (let [key, value] of config.data.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
                } else if (typeof value === 'string' && value.length < 100) {
                    console.log(`${key}: ${value}`);
                } else {
                    console.log(`${key}: [Data too large to display]`);
                }
            }
        }
    } else {
        // Set JSON Content-Type for non-FormData requests
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    }
    
    console.log(`${config.method.toUpperCase()} request to ${config.url} with timestamp ${timestamp}`);
    return config;
}, error => {
    console.error('Request intercept error:', error);
    return Promise.reject(error);
});

// Handle response
instance.interceptors.response.use(
    response => {
        // If this is product data, clear any cached data
        const url = response.config.url || '';
        if (url.includes('/products')) {
            console.log('Request to product endpoint successful:', url);
        }
        
        // Return data directly for convenience
        return response;
    },
    error => {
        // Log detailed error information
        if (error.response) {
            console.error('API Error Response:', 
                error.response.status, 
                error.response.data
            );
            
            // Log request details for debugging
            if (error.config) {
                console.error('Request details:', {
                    url: error.config.url,
                    method: error.config.method,
                    headers: error.config.headers
                });
                
                if (error.config.data instanceof FormData) {
                    console.error('FormData keys:', Array.from(error.config.data.keys()));
                }
            }
        } else if (error.request) {
            console.error('No response received from API:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;
