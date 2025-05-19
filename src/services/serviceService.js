import httpRequest from '~/utils/httpRequest';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
};

const getFromSessionStorage = (key) => {
    const storedData = sessionStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
};

// Get paginated services and cache the result
export const getServicePagination = async (page = 1, limit = 4) => {
    const sessionKey = `services_page_${page}_limit_${limit}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/services?page=${page}&limit=${limit}`);
        const servicesData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, servicesData);

        return servicesData;
    } catch (error) {
        console.error('Error fetching service', error);
        throw error;
    }
};

// Get all services and cache the result
export const getServices = async (forceRefresh = true) => {
    const sessionKey = 'allServices';

    // If forceRefresh is true, skip the cache
    if (!forceRefresh) {
        const cachedData = getFromSessionStorage(sessionKey);
        if (cachedData) {
            return cachedData;
        }
    } else {
        // Clear the cache when forcing refresh
        sessionStorage.removeItem(sessionKey);
    }

    try {
        console.log('Fetching fresh services data from API');
        const response = await httpRequest.get('/services');
        const servicesData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, servicesData);

        return servicesData;
    } catch (error) {
        console.error('Error fetching service', error);
        throw error;
    }
};

// Get service by ID and cache the result
export const getServiceById = async (id) => {
    const sessionKey = `service_${id}`;
    console.log('getServiceById called with ID:', id);

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        console.log('Returning cached service data for ID:', id);
        return cachedData;
    }

    try {
        console.log('Fetching service data for ID:', id);
        // Get all services and find the one with matching ID
        const allServices = await getServices();
        console.log('All services fetched, looking for ID:', id);
        
        // Find the specific service by ID
        const serviceData = allServices.find(service => service.id === parseInt(id));
        
        if (!serviceData) {
            console.error(`Service with id ${id} not found in the list of services`);
            throw new Error(`Service with id ${id} not found`);
        }
        
        console.log('Service found:', serviceData);

        // Chuẩn hóa trường images thành mảng
        if (serviceData && typeof serviceData.images === 'string') {
            serviceData.images = [serviceData.images]; 
        } else if (!serviceData.images) {
            serviceData.images = [];
        }

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, serviceData);

        return serviceData;
    } catch (error) {
        console.error(`Error fetching service detail with id ${id}`, error);
        throw error;
    }
};

// Get services by category and cache the result
export const getServiceByCategory = async (categoryId) => {
    const sessionKey = `services_category_${categoryId}`;

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get(`/services?child_nav_id=${categoryId}`);
        const servicesData = response.data.data;

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, servicesData);

        return servicesData;
    } catch (error) {
        console.error(`Error fetching service for id=${categoryId}:`, error);
        throw error;
    }
};

// Create service (no sessionStorage needed for POST requests)
export const createService = async (serviceData) => {
    try {
        console.log('Creating new service with data:', serviceData);
        
        // Xử lý trường hợp dữ liệu là FormData
        if (serviceData instanceof FormData) {
            // Log FormData trước khi gửi
            console.log('FormData being sent to API:');
            for (let [key, value] of serviceData.entries()) {
                if (key === 'images[]' || key === 'images') {
                    if (value instanceof File) {
                        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
                    } else {
                        console.log(`${key}: ${value instanceof Blob ? 'Blob' : value.substring(0, 50)}`);
                    }
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            // Đảm bảo có ít nhất một ảnh và không là mảng trống
            if (!serviceData.has('images') && !serviceData.has('images[]')) {
                // Thêm ảnh mặc định
                console.log('No images found, adding default image');
                serviceData.append('images', '/images/uploads/default-image.jpg');
            }
            
            // Tạo request sử dụng XMLHttpRequest để hỗ trợ FormData tốt hơn
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${apiUrl}/services`, true);
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Xử lý kết quả thành công
                        try {
                            const data = JSON.parse(xhr.responseText);
                            console.log('Success response:', data);
                            
                            // Xóa cache
                            sessionStorage.removeItem('allServices');
                            
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
                xhr.send(serviceData);
            });
        } else {
            // Đảm bảo có trường images nếu là object
            if (serviceData.images === undefined) {
                serviceData.images = ['/images/uploads/default-image.jpg'];
            }
            
            const response = await httpRequest.post('/services', serviceData);
            console.log('API response:', response.data);

            sessionStorage.removeItem('allServices');
            // Refresh sessionStorage for all services list
            const updatedServices = await getServices();
            saveToSessionStorage('allServices', updatedServices);

            return response.data.data;
        }
    } catch (error) {
        console.error('Error adding service:', error);
        if (error.response) {
            console.error('Server response:', error.response.data);
            console.error('Status:', error.response.status);
        }
        throw error;
    }
};

// Update service and refresh sessionStorage for that service item
export const updateService = async (id, serviceData) => {
    try {
        console.log('Updating service with ID:', id);
        
        // Log FormData keys before sending
        if (serviceData instanceof FormData) {
            console.log('FormData being sent to API:');
            for (let [key, value] of serviceData.entries()) {
                if (key === 'images[]' || key === 'images') {
                    if (value instanceof File) {
                        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
                    } else {
                        console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
                    }
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
        }

        const response = await httpRequest.post(`/services/${id}`, serviceData);
        console.log('API response:', response.data);

        sessionStorage.removeItem(`service_${id}`);
        sessionStorage.removeItem(`allServices`);
        const updatedServices = await getServices();
        saveToSessionStorage('allServices', updatedServices);
        saveToSessionStorage(`service_${id}`, response.data.data);

        return response.data.data;
    } catch (error) {
        console.error(`Error updating service with id ${id}`, error);
        throw error;
    }
};

export const deleteService = async (id) => {
    try {
        // Try multiple potential API endpoints 
        let response;
        try {
            response = await httpRequest.delete(`/service/${id}`); 
        } catch (firstError) {
            console.log('First delete attempt failed, trying alternative endpoint');
            response = await httpRequest.delete(`/services/${id}`);
        }

        // Remove the deleted service from sessionStorage
        sessionStorage.removeItem(`service_${id}`);
        sessionStorage.removeItem(`allServices`);

        // Refresh sessionStorage for all services list
        const updatedServices = await getServices();
        saveToSessionStorage('allServices', updatedServices);
        
        return response.data.data;
    } catch (error) {
        console.error(`Error deleting service with id ${id}`, error);
        throw error;
    }
};
