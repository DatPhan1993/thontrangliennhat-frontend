import httpRequest from '~/utils/httpRequest';
import { refreshAppData } from './utils';
import axios from 'axios';

// Get paginated news
export const getNewsPagination = async (page = 1, limit = 4) => {
    try {
        const response = await httpRequest.get(`/news?page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching news', error);
        throw error;
    }
};

// Get all news
export const getNews = async () => {
    try {
        const response = await httpRequest.get('/news');
        const newsData = response.data.data;
        
        console.log("Raw news data received:", JSON.stringify(newsData));

        // Chuẩn hóa trường images thành mảng cho mỗi tin
        if (Array.isArray(newsData)) {
            newsData.forEach(news => {
                console.log(`News item ${news.id} before normalizing:`, news.images);
                if (typeof news.images === 'string') {
                    news.images = [news.images];
                } else if (!news.images) {
                    news.images = [];
                }
                console.log(`News item ${news.id} after normalizing:`, news.images);
            });
        }

        return newsData;
    } catch (error) {
        console.error('Error fetching news', error);
        throw error;
    }
};

export const getNewsAll = async () => {
    try {
        const response = await httpRequest.get('/news');
        const newsData = response.data.data;

        // Chuẩn hóa trường images thành mảng cho mỗi tin
        if (Array.isArray(newsData)) {
            newsData.forEach(news => {
                if (typeof news.images === 'string') {
                    news.images = [news.images];
                } else if (!news.images) {
                    news.images = [];
                }
            });
        }

        return newsData;
    } catch (error) {
        console.error('Error fetching news', error);
        throw error;
    }
};

// Get featured news
export const getFeaturedNews = async () => {
    try {
        const response = await httpRequest.get('/news/featured');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching featured news', error);
        throw error;
    }
};

// Get top views
export const getTopViews = async () => {
    try {
        const response = await httpRequest.get('/news/views');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching top views', error);
        throw error;
    }
};

// Get news by ID
export const getNewsById = async (id) => {
    try {
        const response = await httpRequest.get(`/news/${id}`);
        const newsData = response.data.data;

        // Chuẩn hóa trường images thành mảng
        if (newsData && typeof newsData.images === 'string') {
            newsData.images = [newsData.images]; 
        } else if (!newsData.images) {
            newsData.images = [];
        }

        return newsData;
    } catch (error) {
        console.error(`Error fetching news detail with id ${id}`, error);
        throw error;
    }
};

// Get news by category
export const getNewsByCategory = async (child_nav_id, startDate = '', endDate = '', page = 1, limit = 10) => {
    try {
        const response = await httpRequest.get('/news', {
            params: {
                child_nav_id,
                startDate,
                endDate,
                page,
                limit,
            },
        });
        const newsData = response.data.data;

        // Chuẩn hóa trường images thành mảng cho mỗi tin
        if (Array.isArray(newsData)) {
            newsData.forEach(news => {
                if (typeof news.images === 'string') {
                    news.images = [news.images];
                } else if (!news.images) {
                    news.images = [];
                }
            });
        }

        return newsData;
    } catch (error) {
        console.error(`Error fetching news for id=${child_nav_id}:`, error);
        throw error;
    }
};

// Create news
export const createNews = async (newsData) => {
    try {
        const response = await httpRequest.post('/news', newsData);
        // Refresh all application data
        await refreshAppData();
        return response.data.data;
    } catch (error) {
        console.error('Error adding news', error);
        throw error;
    }
};

// Update news
export const updateNews = async (id, newsData) => {
    try {
        console.log(`Updating news with ID: ${id}`);
        
        // For direct debugging - log form data contents
        if (newsData instanceof FormData) {
            console.log("FormData contents:");
            for (let [key, value] of newsData.entries()) {
                console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
            }
        }
        
        // If it's FormData with file uploads, use FormData directly with POST
        if (newsData instanceof FormData && newsData.has('images[]')) {
            // Check if we have a file upload
            let hasFileUpload = false;
            for (let [key, value] of newsData.entries()) {
                if (key === 'images[]' && value instanceof File) {
                    hasFileUpload = true;
                    break;
                }
            }
            
            if (hasFileUpload) {
                console.log("Has file upload, using POST with FormData");
                // Use the upload endpoint for file uploads
                const apiUrl = process.env.REACT_APP_API_URL || 'https://api.thontrangliennhat.com/api';
                const fileUploadEndpoint = `${apiUrl}/news/${id}/upload`;
                
                const response = await axios.post(fileUploadEndpoint, newsData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                console.log("File upload response:", response.status, response.statusText);
                await refreshAppData();
                return response.data.data;
            }
        }
        
        // Otherwise, use PATCH with JSON for regular updates
        const apiUrl = process.env.REACT_APP_API_URL || 'https://api.thontrangliennhat.com/api';
        const endpoint = `${apiUrl}/news/${id}`;
        console.log(`Using API URL: ${endpoint}`);
        
                    // Convert FormData to a regular object for PATCH
        let dataToSend = newsData;
        if (newsData instanceof FormData) {
            const formObject = {};
            let hasImages = false;
            
            for (let [key, value] of newsData.entries()) {
                if (key === 'images[]') {
                    hasImages = true;
                    if (value instanceof File) {
                        // Skip files in PATCH request - handled above with POST
                        console.log("Skipping file in PATCH request:", value.name);
                        continue;
                    } else {
                        // String value - existing image path
                        formObject.images = value;
                    }
                } else if (key === 'isFeatured') {
                    formObject.isFeatured = value === '1' || value === 1 || value === true || value === 'true';
                } else if (key === 'views') {
                    // Ensure views is a number
                    formObject.views = parseInt(value, 10) || 0;
                } else {
                    formObject[key] = value;
                }
            }
            
            if (!hasImages) {
                // Ensure images field is preserved
                console.log("No images field found in FormData, checking for image field");
                if (newsData.has('image')) {
                    const imageValue = newsData.get('image');
                    if (imageValue) {
                        formObject.images = imageValue;
                        console.log("Using image field value for images:", imageValue);
                    }
                }
            }
            
            dataToSend = formObject;
            console.log("Converted FormData to object:", dataToSend);
        }
        
        const response = await axios({
            method: 'patch',
            url: endpoint,
            data: dataToSend,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
            },
            withCredentials: false
        });
        
        console.log("API response:", response.status, response.statusText);
        await refreshAppData();
        return response.data.data;
    } catch (error) {
        console.error(`Error updating news with id ${id}:`, error);
        
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

// Delete news
export const deleteNews = async (id) => {
    try {
        await httpRequest.delete(`/news/${id}`);
        // Refresh all application data
        await refreshAppData();
    } catch (error) {
        console.error(`Error deleting news with id ${id}`, error);
        throw error;
    }
};

