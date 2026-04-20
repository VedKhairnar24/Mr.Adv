import axios from 'axios';

// Create axios instance with backend API base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to include auth token and handle FormData
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser/axios handle it
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type header for FormData so browser can set it with boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
