import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Auto-login with existing token
      autoLogin();
    } else {
      // No auto demo creation, user must login
      setLoading(false);
    }
  }, []);

  const autoLogin = async () => {
    try {
      // Try to validate the token with the server
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Token is invalid, remove it
      logout();
    } finally {
      setLoading(false);
    }
  };



  const login = async (email, password = null) => {
    try {
      const payload = password ? { email, password } : { email };
      const response = await api.post('/api/auth/login', payload);
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);

      return { success: true };
    } catch (error) {

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  };

  const register = async (email, name, password = null) => {
    try {
      const payload = password && password.trim() ? { email, name, password } : { email, name };
      const response = await api.post('/api/auth/register', payload);
      const { token: newToken, user: newUser, message } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);

      return { success: true, message };
    } catch (error) {

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};