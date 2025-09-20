import React, { createContext, useState, useEffect, useCallback } from 'react';
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
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAuthenticated(false);
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
          // If we have a token, consider the user authenticated
          // In production, you should verify the token with the backend
          console.log('Found stored token, auto-authenticating user');
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

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post('/login', {
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        setUser({
          id: response.data.user.id,
          name: response.data.user.username,
          email: response.data.user.email,
        });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (username, email, password) => {
    try {
      const response = await axios.post('/register', {
        username,
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        setUser({
          id: response.data.user.id,
          name: response.data.user.username,
          email: response.data.user.email,
        });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: true, message: 'Registration successful. Please sign in.' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Google login function - matches backend expectation
  const googleLogin = useCallback(async (credential) => {
    try {
      const response = await axios.post('/google-login', {}, {
        headers: {
          'id_token': credential
        }
      });

      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        // For now, we'll create a basic user object since backend doesn't return user data
        setUser({
          id: 'google-user',
          name: 'Google User',
          email: 'google@example.com'
        });
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
  const updateProfile = useCallback(async (_userData) => {
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

export default AuthContext;