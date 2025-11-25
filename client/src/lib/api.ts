import axios from 'axios';

// API base URL - uses environment variable in production, proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('ersoz-auth');
    if (auth) {
      try {
        const { state } = JSON.parse(auth);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = localStorage.getItem('ersoz-auth');
        if (auth) {
          const { state } = JSON.parse(auth);
          
          if (state?.refreshToken) {
            // Try to refresh the token
            const response = await axios.post(
              `${API_BASE_URL}/v1/auth/refresh`,
              { refreshToken: state.refreshToken }
            );

            const { token, refreshToken } = response.data.data;

            // Update localStorage with new tokens
            const updatedAuth = {
              ...JSON.parse(auth),
              state: {
                ...state,
                token,
                refreshToken: refreshToken || state.refreshToken,
              },
            };
            localStorage.setItem('ersoz-auth', JSON.stringify(updatedAuth));

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('ersoz-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
