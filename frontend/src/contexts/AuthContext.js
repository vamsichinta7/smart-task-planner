import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Auto-login with existing token
      autoLogin();
    } else {
      // Demo mode - create a demo user
      createDemoUser();
    }
  }, []);

  const autoLogin = async () => {
    try {
      // In a real app, you'd validate the token with the server
      // For now, we'll decode the JWT payload (not secure in production!)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.userId,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0]
      });
    } catch (error) {
      console.error('Auto-login failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    try {
      const demoEmail = 'demo@smarttaskplanner.com';
      const response = await axios.post('/api/auth/login', {
        email: demoEmail
      });

      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Demo user creation failed:', error);
      // Continue without auth for demo purposes
      setUser({
        id: 'demo',
        email: 'demo@smarttaskplanner.com',
        name: 'Demo User'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, name) => {
    try {
      const response = await axios.post('/api/auth/login', { email });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (email, name) => {
    try {
      const response = await axios.post('/api/auth/register', { email, name });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
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