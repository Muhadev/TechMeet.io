// src/lib/axios.ts
import axios from 'axios';
import { getStoredToken, refreshAccessToken, removeToken, ensureValidToken } from './token';

// Create an Axios instance with default configs
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://techmeetio.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10 second timeout
  // withCredentials: true, // Important for CORS with cookies/sessions
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Skip token handling for auth endpoints
    const authEndpoints = ['/auth/register/', '/auth/token/'];
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isAuthEndpoint) {
      // Only ensure valid token for non-auth endpoints
      const token = await ensureValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For auth endpoints, just use stored token if available
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Update authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, force logout
        removeToken();
        // Use router navigation instead of window.location for better UX
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other common errors
    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access forbidden:', error.response.data);
    } else if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;