import httpRequest from '~/utils/httpRequest';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

const getFromSessionStorage = (key) => {
    const storedData = sessionStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
};

// Function to check if in development environment
const isDevelopment = () => {
    return process.env.NODE_ENV === 'development';
};

// Server API base URL
const LOCAL_API_URL = 'http://localhost:3001/api';

// Helper function to fetch from database.json in development
const fetchFromDatabaseJson = async () => {
    try {
        const response = await fetch('/phunongbuondon-api/database.json');
        if (!response.ok) {
            // Try alternate location if first attempt fails
            const altResponse = await fetch('./phunongbuondon-api/database.json');
            if (!altResponse.ok) {
                throw new Error(`Failed to fetch database.json`);
            }
            return await altResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching database.json:', error);
        throw error;
    }
};

// Try to use local API first, then fall back to other methods
const callLocalApi = async (endpoint, method = 'GET', data = null) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                // Thêm timestamp để đảm bảo request luôn mới
                'X-Timestamp': Date.now()
            },
            // Đảm bảo không cache kết quả
            cache: 'no-store'
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        // Thêm tham số timestamp để tránh cache
        const timestamp = Date.now();
        const apiUrl = `${LOCAL_API_URL}/${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${timestamp}`;
        
        console.log(`Calling API: ${apiUrl} with method ${method}`);
        const response = await fetch(apiUrl, options);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error using local API (${endpoint}):`, error);
        throw error;
    }
};

// Images
export const getImagesPagination = async (page = 1, limit = 9) => {
    const sessionKey = `imagesPagination_page_${page}_limit_${limit}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/image?page=${page}&limit=${limit}`);
        const imagesData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, imagesData);

        return imagesData;
    } catch (error) {
        console.error('Error fetching images', error);
        throw error;
    }
};

export const getImages = async () => {
    // Clear all possible cached data
    sessionStorage.removeItem('allImages');
    localStorage.removeItem('allImages');
    
    console.log('Fetching fresh images data, no cache');
        
        // First try using local API
        try {
            console.log('Attempting to fetch images from local API...');
        
        // Gọi API với cache busting
        const timestamp = Date.now();
        const apiUrl = isDevelopment() 
            ? `http://localhost:3001/api/images?_=${timestamp}` 
            : `/api/images?_=${timestamp}`;
        
        console.log('Calling API:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('API response:', result);
        
        // Kiểm tra cấu trúc phản hồi
            const imagesData = result.data || [];
        
        // Thêm kiểm tra để đảm bảo imagesData là một mảng
        if (!Array.isArray(imagesData)) {
            console.warn('API returned data that is not an array, using empty array instead');
            return [];
        }
        
        console.log('Successfully fetched images from API:', imagesData);
        
                return imagesData;
            } catch (apiError) {
        console.error('API error, falling back to database.json', apiError);
                
                // If in development mode, fallback to database.json
                if (isDevelopment()) {
                    console.log('Attempting to fetch images from database.json...');
                    try {
                        const database = await fetchFromDatabaseJson();
                        
                        // Ensure images is an array
                        if (!database.images) {
                            console.warn('No images array found in database.json, creating empty array');
                            database.images = [];
                        }
                        
                        if (!Array.isArray(database.images)) {
                            console.warn('images is not an array in database.json, using empty array');
                            database.images = [];
                        }
                        
                        console.log('Successfully fetched images from database.json:', database.images);
                
                        return database.images;
                    } catch (dbError) {
                        console.error('Failed to load from database.json:', dbError);
                        return []; // Return empty array on error
                    }
                }
        
        console.error('Error fetching images:', apiError);
        return []; // Return empty array on error
    }
};

export const createImage = async (imageData) => {
    try {
        // First, make sure to clear any cached images to ensure fresh data
        sessionStorage.removeItem('allImages');
        localStorage.removeItem('allImages');
        
        // Store original form data for API calls
        const originalData = imageData;
        
        // Check if we have a File object (from FormData in the browser)
        let fileObject = null;
        let fileName = '';
        let imageUrl = '';
        
        if (originalData instanceof FormData) {
            // Try to get the file object
            fileObject = originalData.get('image');
            if (fileObject && fileObject instanceof File) {
                fileName = fileObject.name || 'image.jpg';
                console.log('FormData contains file object:', fileName);
            } else {
                console.log('FormData does not contain valid file object');
                throw new Error('No valid image file in form data');
            }
        } else {
            throw new Error('Form data required for image upload');
        }
        
        // Step 1: Upload the file first
        try {
            console.log('Uploading image file...');
            
            // Determine the correct API endpoint based on environment
            const apiBaseUrl = isDevelopment() 
                ? 'http://localhost:3001/api' 
                : '/api';  // In production this will be relative to the host
            
            console.log('Using API base URL:', apiBaseUrl);
            
            // Upload the file using the special file upload endpoint
            const uploadResponse = await fetch(`${apiBaseUrl}/upload/image`, {
                method: 'POST',
                body: originalData
            });
            
            if (!uploadResponse.ok) {
                throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('File upload result:', uploadResult);
            
            // Get the URL of the uploaded file
            // Sử dụng URL đầy đủ nếu có, nếu không sẽ sử dụng URL tương đối
            imageUrl = uploadResult.data.absoluteUrl || uploadResult.data.url;
            
            console.log('Will use image URL:', imageUrl);
            
            // Nếu đang dùng URL tương đối, thêm domain
            if (imageUrl.startsWith('/') && isDevelopment()) {
                imageUrl = `http://localhost:3001${imageUrl}`;
                console.log('Modified to absolute URL:', imageUrl);
            }
            
            // Log the full URL to debug
            console.log('Full image URL that will be saved:', imageUrl);
            
            // Step 2: Create the image record with metadata
            console.log('Creating image record with URL:', imageUrl);
            
            // Directly call API instead of using callLocalApi
            const createResponse = await fetch(`${apiBaseUrl}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                url: imageUrl,
                name: originalData.get('name') || fileName || 'New Image',
                description: originalData.get('description') || 'Image description'
                })
            });
            
            if (!createResponse.ok) {
                throw new Error(`Failed to create image record: ${createResponse.status} ${createResponse.statusText}`);
            }
            
            const createResult = await createResponse.json();
            
            // Make sure cached data is completely cleared
            sessionStorage.removeItem('allImages');
            localStorage.removeItem('allImages');
            
            console.log('Image uploaded successfully:', createResult.data);
            return createResult.data;
        } catch (apiError) {
            console.error('API error during image upload:', apiError);
            
            // In development mode, we'll try a simplified approach with mocked data
            if (isDevelopment()) {
                console.log('Development mode: Creating fallback image record');
                
                try {
                    const database = await fetchFromDatabaseJson();
                    
                    if (!database.images) {
                        database.images = [];
                    }
                    
                    // Ensure images is an array
                    if (!Array.isArray(database.images)) {
                        database.images = [];
                    }
                    
                    // Generate a new ID
                    const newId = database.images.length > 0 
                        ? Math.max(...database.images.map(img => Number(img.id) || 0)) + 1 
                        : 1;
                    
                    // Create a mock image URL
                    const mockImageUrl = `/images/uploads/mock-${Date.now()}.jpg`;
                    
                    // Create a new image object
                    const newImage = {
                        id: newId,
                        url: mockImageUrl,
                        name: originalData.get('name') || fileName || 'New Image',
                        description: originalData.get('description') || 'Image from local development',
                        createdAt: new Date().toISOString()
                    };
                    
                    // Add to our cached database
                    database.images.push(newImage);
                    
                    // Clear existing cache
                    sessionStorage.removeItem('allImages');
                    localStorage.removeItem('allImages');
                    
                    console.log('Created fallback image record:', newImage);
                    return newImage;
                } catch (fallbackError) {
                    console.error('Error creating fallback image:', fallbackError);
                    throw fallbackError;
                }
            }
            
            // In production, throw the original error
            throw apiError;
        }
    } catch (error) {
        console.error('Error adding image', error);
        throw error;
    }
};

export const updateImage = async (imageId, updatedData) => {
    try {
        const response = await httpRequest.put(`/images/${imageId}`, updatedData);

        // Refresh sessionStorage for the specific image and all images list
        sessionStorage.removeItem(`image_${imageId}`);
        const updatedImages = await getImages();
        saveToSessionStorage('allImages', updatedImages);

        return response.data.data;
    } catch (error) {
        console.error('Error updating image', error);
        throw error;
    }
};

export const deleteImage = async (imageId) => {
    try {
        await httpRequest.delete(`/images/${imageId}`);

        // Remove the deleted image from sessionStorage
        sessionStorage.removeItem(`image_${imageId}`);
        sessionStorage.removeItem('allImages');

        // Refresh sessionStorage for all images list
        const updatedImages = await getImages();
        saveToSessionStorage('allImages', updatedImages);
    } catch (error) {
        console.error('Error deleting image', error);
        throw error;
    }
};

// Videos
export const getVideos = async () => {
    const sessionKey = 'allVideos';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        // First try using local API
        try {
            const result = await callLocalApi('videos');
            const videosData = result.data || [];
            saveToSessionStorage(sessionKey, videosData);
            return videosData;
        } catch (localApiError) {
            console.log('Local API error, trying main API', localApiError);
            
            // Then try using main API
            try {
                const response = await httpRequest.get('/videos');
                const videosData = response.data.data || [];
                saveToSessionStorage(sessionKey, videosData);
                return videosData;
            } catch (apiError) {
                // If in development mode, fallback to database.json
                if (isDevelopment()) {
                    console.log('API error, falling back to database.json for videos', apiError);
                    try {
                        const database = await fetchFromDatabaseJson();
                        // Đảm bảo videos là một mảng (ngay cả khi không có trong database.json)
                        if (!database.videos) {
                            console.warn('No videos array found in database.json, creating empty array');
                            database.videos = [];
                        }
                        
                        // Đảm bảo videos là một mảng
                        if (!Array.isArray(database.videos)) {
                            console.warn('videos is not an array in database.json, using empty array');
                            database.videos = [];
                        }
                        
                        saveToSessionStorage(sessionKey, database.videos);
                        return database.videos;
                    } catch (dbError) {
                        console.error('Error loading from database.json:', dbError);
                        return []; // Trả về mảng rỗng nếu có lỗi
                    }
                }
                // In production, throw the original error
                throw apiError;
            }
        }
    } catch (error) {
        console.error('Error fetching videos', error);
        return []; // Trả về mảng rỗng thay vì ném lỗi
    }
};

export const getVideosPagination = async (page = 1, limit = 9) => {
    const sessionKey = `videosPagination_page_${page}_limit_${limit}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/videos?page=${page}&limit=${limit}`);
        const videosData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, videosData);

        return videosData;
    } catch (error) {
        console.error('Error fetching videos', error);
        throw error;
    }
};

export const createVideo = async (videoData) => {
    try {
        // First try local API
        try {
            console.log('Thử sử dụng local API để thêm video:', videoData);
            const result = await callLocalApi('videos', 'POST', videoData);
            
            // Xóa tất cả cache liên quan đến videos
            sessionStorage.removeItem('allVideos');
            
            // Xóa tất cả cache pagination
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('videosPagination_')) {
                    sessionStorage.removeItem(key);
                }
            });
            
            // Refresh sessionStorage for all videos list
            try {
                const updatedVideos = await getVideos();
                saveToSessionStorage('allVideos', updatedVideos);
            } catch (refreshError) {
                console.error('Could not refresh videos after create', refreshError);
                // Thêm video mới vào cache hiện có
                try {
                    const existingVideos = getFromSessionStorage('allVideos') || [];
                    if (Array.isArray(existingVideos)) {
                        const newVideoWithId = result.data;
                        saveToSessionStorage('allVideos', [...existingVideos, newVideoWithId]);
                    }
                } catch (cacheError) {
                    console.error('Error updating local cache', cacheError);
                }
            }
            
            return result.data;
        } catch (localApiError) {
            console.log('Local API error, trying main API', localApiError);
            
            // Then try main API
            try {
                const response = await httpRequest.post('/videos', videoData);
                
                // Xóa tất cả cache liên quan đến videos
                sessionStorage.removeItem('allVideos');
                
                // Xóa tất cả cache pagination
                const keys = Object.keys(sessionStorage);
                keys.forEach(key => {
                    if (key.startsWith('videosPagination_')) {
                        sessionStorage.removeItem(key);
                    }
                });
                
                // Refresh sessionStorage for all videos list
                try {
                    const updatedVideos = await getVideos();
                    saveToSessionStorage('allVideos', updatedVideos);
                } catch (refreshError) {
                    console.error('Could not refresh videos after create', refreshError);
                    // Thêm video mới vào cache hiện có
                    try {
                        const existingVideos = getFromSessionStorage('allVideos') || [];
                        if (Array.isArray(existingVideos)) {
                            const newVideoWithId = { 
                                ...response.data.data,
                                id: response.data.data.id || Date.now() // fallback ID nếu không có
                            };
                            saveToSessionStorage('allVideos', [...existingVideos, newVideoWithId]);
                        }
                    } catch (cacheError) {
                        console.error('Error updating local cache', cacheError);
                    }
                }
                
                return response.data.data;
            } catch (apiError) {
                // If in development mode, handle locally
                if (isDevelopment()) {
                    console.log('API error, handling video creation locally', apiError);
                    
                    // Lấy database.json hiện tại hoặc tạo mảng rỗng
                    let database = { videos: [] };
                    try {
                        database = await fetchFromDatabaseJson();
                        if (!database.videos) {
                            database.videos = [];
                        }
                        
                        // Đảm bảo videos là một mảng
                        if (!Array.isArray(database.videos)) {
                            database.videos = [];
                        }
                    } catch (dbError) {
                        console.warn('Could not load database.json, using empty videos array', dbError);
                    }
                    
                    // Generate a new ID
                    const newId = database.videos.length > 0 
                        ? Math.max(...database.videos.map(video => Number(video.id) || 0)) + 1 
                        : 1;
                    
                    const newVideo = {
                        id: newId,
                        url: videoData.url,
                        name: videoData.name,
                        description: videoData.description,
                        created_at: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                    };
                    
                    // Just return the video without actually modifying database.json
                    // as we can't write to it directly in browser
                    console.log('Video would be created in database.json:', newVideo);
                    
                    // Xóa tất cả cache liên quan đến videos
                    sessionStorage.removeItem('allVideos');
                    
                    // Xóa tất cả cache pagination
                    const keys = Object.keys(sessionStorage);
                    keys.forEach(key => {
                        if (key.startsWith('videosPagination_')) {
                            sessionStorage.removeItem(key);
                        }
                    });
                    
                    // Update session storage
                    const updatedVideos = [...database.videos, newVideo];
                    saveToSessionStorage('allVideos', updatedVideos);
                    
                    return newVideo;
                }
                // In production, throw the original error
                throw apiError;
            }
        }
    } catch (error) {
        console.error('Error adding video', error);
        throw error;
    }
};

export const updateVideo = async (videoId, updatedData) => {
    try {
        const response = await httpRequest.put(`/videos/${videoId}`, updatedData);

        // Refresh sessionStorage for the specific video and all videos list
        sessionStorage.removeItem(`video_${videoId}`);
        const updatedVideos = await getVideos();
        saveToSessionStorage('allVideos', updatedVideos);

        return response.data.data;
    } catch (error) {
        console.error('Error updating video', error);
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        await httpRequest.delete(`/videos/${videoId}`);

        sessionStorage.removeItem('allVideos');
        // Remove the deleted video from sessionStorage
        sessionStorage.removeItem(`video_${videoId}`);

        // Refresh sessionStorage for all videos list
        const updatedVideos = await getVideos();
        saveToSessionStorage('allVideos', updatedVideos);
    } catch (error) {
        console.error('Error deleting video', error);
        throw error;
    }
};
