import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://api.thontrangliennhat.com';

const httpRequest = axios.create({
    baseURL: BASE_URL,
});

httpRequest.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            config.headers.Accept = `charset=UTF-8`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const get = async (path, options = {}) => {
    const response = await httpRequest.get(path, options);
    return response.data;
};

export const post = async (path, data, options = {}) => {
    const response = await httpRequest.post(path, data, options);
    return response.data;
};

export const put = async (path, data, options = {}) => {
    const response = await httpRequest.put(path, data, options);
    return response.data;
};

export const del = async (path, options = {}) => {
    const response = await httpRequest.delete(path, options);
    return response.data;
};

export default httpRequest; 