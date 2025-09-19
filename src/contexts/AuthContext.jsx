import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;

    // Add request interceptor for auth token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear auth state
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Since backend doesn't have verify endpoint, we'll just assume token is valid
          // In production, you might want to add a verify endpoint to the backend
          setUser({
            id: 'google-user',
            name: 'Google User',
            email: 'google@example.com'
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function - disabled since backend doesn't have this endpoint
  const login = useCallback(async (email, password) => {
    return {
      success: false,
      error: 'Email/password login is not available. Please use Google sign-in.'
    };
  }, []);

  // Register function - disabled since backend doesn't have this endpoint
  const register = useCallback(async (username, email, password) => {
    return {
      success: false,
      error: 'Registration is not available. Please use Google sign-in.'
    };
  }, []);

  // Google login function - matches backend expectation
  const googleLogin = useCallback(async (credential) => {
    try {
      // Check if this is test mode
      const isTestMode = credential === 'test_credential';
      
      const requestData = isTestMode 
        ? { testMode: true } 
        : { credential };

      const response = await axios.post('/google-login', requestData);

      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        // Use actual user data from backend response
        const userData = response.data.user || {
          id: 'google-user',
          name: 'Google User',
          email: 'google@example.com'
        };
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Google authentication failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.message || 'Google authentication failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Since backend doesn't have logout endpoint, just clear local storage
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if there's an error
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update user profile - disabled since backend doesn't have this endpoint
  const updateProfile = useCallback(async (userData) => {
    return {
      success: false,
      error: 'Profile update is not available in the current backend implementation.'
    };
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;