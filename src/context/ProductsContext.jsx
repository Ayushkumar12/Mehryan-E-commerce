import React, { createContext, useContext, useReducer, useEffect } from 'react';
import productService from '../services/productService';

// Products Context
const ProductsContext = createContext();

// Products Reducer
const productsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        )
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload)
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    default:
      return state;
  }
};

// Initial State
const initialState = {
  products: [],
  loading: true,
  error: null
};

// Products Provider Component
export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  // Load products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await productService.getAllProducts();
        dispatch({ type: 'SET_PRODUCTS', payload: response.products || [] });
      } catch (error) {
        console.error('Error fetching products:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load products' });
      }
    };

    fetchProducts();
  }, []);

  const addProduct = async (product) => {
    try {
      const response = await productService.addProduct(product);
      dispatch({ type: 'ADD_PRODUCT', payload: response.product });
      return response.product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const response = await productService.updateProduct(id, product);
      dispatch({ type: 'UPDATE_PRODUCT', payload: response.product });
      return response.product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProductsByCategory = (category) => {
    return state.products.filter(product => product.category === category);
  };

  const getProductById = (id) => {
    return state.products.find(product => product._id === id);
  };

  const value = {
    products: state.products,
    loading: state.loading,
    error: state.error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductById
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

// Custom hook to use Products Context
// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};