import apiClient from './api';

export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  createStripeCheckoutSession: async (payload) => {
    const response = await apiClient.post('/orders/stripe-checkout', payload);
    return response.data;
  },

  // Get user orders
  getUserOrders: async () => {
    const response = await apiClient.get('/orders/user');
    return response.data;
  },

  // Get single order
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  // Update order (Admin)
  updateOrder: async (id, updateData) => {
    const response = await apiClient.put(`/orders/${id}`, updateData);
    return response.data;
  },

  // Delete order (Admin)
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  }
};

export default orderService;