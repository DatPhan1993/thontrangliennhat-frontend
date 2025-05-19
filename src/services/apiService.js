import axios from 'axios';

// Determine API base URL based on environment
let baseURL = '';

// Development environment
if (process.env.NODE_ENV === 'development') {
    baseURL = 'http://localhost:3001/api';
} 
// Production environment
else {
    // Check if we're running on Vercel
    if (process.env.VERCEL_URL) {
        baseURL = `https://${process.env.VERCEL_URL}/api`;
    } 
    // For other production environments
    else {
        baseURL = 'https://thontrangliennhat.com/api';
    }
}

console.log('API Service using baseURL:', baseURL);

// Create axios instance with custom config
const api = axios.create({
    baseURL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Add a timestamp to GET requests to prevent caching
api.interceptors.request.use(config => {
    if (config.method === 'get') {
        config.params = config.params || {};
        // Add timestamp to prevent caching
        config.params._ = Date.now();
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    response => {
        // Handle successful responses
        if (response.data && response.data.data) {
            return response.data;
        }
        return response;
    },
    error => {
        // Handle errors
        console.error('API request failed:', error);
        
        if (error.response) {
            // Server responded with a status code outside of 2xx range
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api; 