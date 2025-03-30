import axios from 'axios';

const API_URL = 'http://localhost:8088';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    primary_skill?: string;
    secondary_skill?: string;
    learning_goal?: string;
  }) => apiClient.post('/register', userData),
  
  login: (credentials: { 
    username: string; 
    password: string 
  }) => apiClient.post('/login', credentials),
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: () => apiClient.get('/profile'),
  
  // Update user profile
  updateProfile: (profileData: {
    primary_skill?: string;
    secondary_skill?: string;
    learning_goal?: string;
  }) => apiClient.put('/profile', profileData),
};

// Matching API
export const matchingAPI = {
  // Get recommended matches
  getMatches: () => apiClient.post('/predict'),
};

export default apiClient;