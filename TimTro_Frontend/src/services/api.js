import axios from 'axios';

// Khai báo danh sách các đường dẫn API (HTTP và HTTPS)
const baseUrls = [
    'http://localhost:5164/api',
    'https://localhost:7260/api'
];

const api = axios.create({
    baseURL: baseUrls[0], // Bắt đầu thử với URL đầu tiên
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

// Intercept responses to handle fallback & global errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        
        // Nếu không có phản hồi (Lỗi Network/Connection Refused) và chưa thử lại
        if (!error.response && !config._retry) {
            config._retry = true;
            
            // Tìm URL dự phòng khác với URL vừa thất bại
            const currentBaseUrl = config.baseURL;
            const nextBaseUrl = baseUrls.find(url => url !== currentBaseUrl);
            
            if (nextBaseUrl) {
                console.log(`Đổi API URL sang dự phòng: ${nextBaseUrl}`);
                config.baseURL = nextBaseUrl;
                api.defaults.baseURL = nextBaseUrl; // Cập nhật cho các request sau
                return api(config); // Thử gọi lại request
            }
        }

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
