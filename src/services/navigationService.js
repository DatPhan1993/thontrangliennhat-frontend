import httpRequest from '~/utils/httpRequest';

// Helper functions for sessionStorage
const saveToSessionStorage = (key, data) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
    }
};

const getFromSessionStorage = (key) => {
    try {
        const storedData = sessionStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
        console.error('Error getting from sessionStorage:', error);
        return null;
    }
};

// Navigation Links
export const getNavigationLinks = async () => {
    const sessionKey = 'navigationLinks';

    const cachedData = getFromSessionStorage(sessionKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await httpRequest.get('/api/parent-navs/all-with-child');
        // Kiểm tra xem response.data có phải là mảng không
        // Nếu là mảng, sử dụng trực tiếp, nếu là object có thuộc tính data, sử dụng data
        const navigationLinks = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        // Đảm bảo tất cả các phần tử đều có mảng children
        const processedLinks = navigationLinks.map(link => ({
            ...link,
            children: link.children || []
        }));

        // Save to sessionStorage
        saveToSessionStorage(sessionKey, processedLinks);

        return processedLinks;
    } catch (error) {
        console.error('Error fetching navigation links:', error);
        // Trả về mảng trống trong trường hợp lỗi để tránh lỗi app
        return [];
    }
}; 