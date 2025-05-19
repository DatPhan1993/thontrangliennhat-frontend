import routes from './routes';

// Xác định base URL của trang web hiện tại
const getBaseUrl = () => {
    // Trong môi trường trình duyệt
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // Nếu không có window object (môi trường nodejs)
    return process.env.REACT_APP_BASE_URL?.split('/api')[0] || 'https://thontrangliennhat.com';
};

const config = {
    routes,
    apiUrl: process.env.REACT_APP_BASE_URL?.split('/api')[0] || 'https://thontrangliennhat.com',
    uploadUrl: `${getBaseUrl()}/uploads`,
    uploadImageUrl: `${getBaseUrl()}/images/uploads`,
    imageUrl: `${getBaseUrl()}/images`,
    publicUrl: process.env.REACT_APP_PUBLIC_URL || 'https://thontrangliennhat.com',
};

export default config;
