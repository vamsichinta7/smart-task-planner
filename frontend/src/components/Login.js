import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
    
    // Clear password when switching to demo email
    if (name === 'email' && value === 'demo@smarttaskplanner.com') {
      setFormData(prev => ({
        ...prev,
        email: value,
        password: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    // Password validation - only required for non-demo accounts during login
    if (isLogin && !formData.password.trim() && formData.email !== 'demo@smarttaskplanner.com') {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.name, formData.password);
      }

      if (!result.success) {
        setError(result.error || 'Authentication failed');
      } else if (!isLogin) {
        setSuccess(result.message || 'Account created successfully! You are now logged in.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Try demo login with password first, then fallback to passwordless
      let result = await login('demo@smarttaskplanner.com', 'demo');
      
      if (!result.success) {
        // Fallback to passwordless demo login
        result = await login('demo@smarttaskplanner.com');
      }
      
      if (!result.success) {
        setError(result.error || 'Demo login failed. Please try manual login.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Failed to connect to demo account. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <h1>Smart Task Planner</h1>
          <p>Plan smarter, achieve more with AI-powered task management</p>
          <div className="demo-info">
            <p><strong>Demo:</strong> Click "Try Demo Account" or use email: demo@smarttaskplanner.com</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={formData.email === 'demo@smarttaskplanner.com' ? 'demo-email' : ''}
              required
            />
            {formData.email === 'demo@smarttaskplanner.com' && (
              <div className="demo-hint">
                ✨ Demo mode detected! Password is optional.
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              Password {formData.email === 'demo@smarttaskplanner.com' ? '(Optional for demo)' : ''}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={formData.email === 'demo@smarttaskplanner.com' ? 'Leave empty for demo' : 'Enter your password'}
              required={isLogin && formData.email !== 'demo@smarttaskplanner.com'}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="demo-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Connecting...
            </>
          ) : (
            'Try Demo Account'
          )}
        </button>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;