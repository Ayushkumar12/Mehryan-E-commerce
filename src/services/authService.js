import apiClient from './api';

export const authService = {
  // Sign up
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('mehryaan_token', response.data.token);
      localStorage.setItem('mehryaan_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('mehryaan_token', response.data.token);
      localStorage.setItem('mehryaan_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('mehryaan_token');
    localStorage.removeItem('mehryaan_user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return null;
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/updateprofile', userData);
    if (response.data.user) {
      localStorage.setItem('mehryaan_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get user profile with all orders
  getProfileWithOrders: async () => {
    const response = await apiClient.get('/auth/profile-with-orders');
    return response.data;
  }
};

export default authService;