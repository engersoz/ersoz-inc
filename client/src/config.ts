// API Configuration
// This file provides the API base URL for the application

// Get API URL from environment variable or use production default
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'https://ersoz-inc-api.onrender.com/api';

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Export other config as needed
export const config = {
  apiUrl: API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
