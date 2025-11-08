import axios from 'axios';

const API_BASE_URL = 'https://mehryan-e-commerce.onrender.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mehryaan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mehryaan_token');
      localStorage.removeItem('mehryaan_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;