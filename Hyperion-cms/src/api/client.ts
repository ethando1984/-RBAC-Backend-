import axios from 'axios';

const HEMERA_API_BASE_URL = 'http://localhost:8081/api';
const IAM_API_BASE_URL = 'http://localhost:8080/api';

export const hemeraApi = axios.create({
    baseURL: HEMERA_API_BASE_URL,
});

export const iamApi = axios.create({
    baseURL: IAM_API_BASE_URL,
});

// Add request interceptor to add token
const addTokenToRequest = (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

hemeraApi.interceptors.request.use(addTokenToRequest);
iamApi.interceptors.request.use(addTokenToRequest);

// Add response interceptor to handle 401
const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
};

hemeraApi.interceptors.response.use((response) => response, handleAuthError);
iamApi.interceptors.response.use((response) => response, handleAuthError);
