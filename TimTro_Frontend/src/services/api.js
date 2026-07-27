import axios from 'axios';

// Lấy API URL từ biến môi trường (nếu có trên Vercel), nếu không thì dùng localhost (khi code ở máy)
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7260/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercept requests to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept responses to handle global errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {

        // Token expired or invalid
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
