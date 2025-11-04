import apiClient from './api';

export const productService = {
  // Get all products
  getAllProducts: async (category = '', search = '', sort = '') => {
    let query = '';
    const params = [];

    if (category) params.push(`category=${category}`);
    if (search) params.push(`search=${search}`);
    if (sort) params.push(`sort=${sort}`);

    if (params.length > 0) {
      query = '?' + params.join('&');
    }

    const response = await apiClient.get(`/products${query}`);
    return response.data;
  },

  // Get single product
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Add product (Admin)
  addProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;