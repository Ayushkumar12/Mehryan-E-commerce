import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// User Context
const UserContext = createContext();

// User Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
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
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// User Provider Component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mehryaan_user');
    const token = localStorage.getItem('mehryaan_token');
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN', payload: userData });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('mehryaan_user');
        localStorage.removeItem('mehryaan_token');
      }
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(email, password);
      dispatch({ type: 'LOGIN', payload: response.user });
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.signup(userData);
      dispatch({ type: 'LOGIN', payload: response.user });
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({ type: 'UPDATE_PROFILE', payload: response.user });
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use User Context
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};