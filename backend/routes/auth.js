const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUser, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', validateUser, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user (password is optional for demo)
    const userData = { email, name };
    if (password && password.trim()) {
      userData.password = password;
    }
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully! Welcome to Smart Task Planner.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    let user = await User.findOne({ email });

    // For demo accounts, create if doesn't exist
    if (!user && email === 'demo@smarttaskplanner.com') {
      user = new User({ 
        email, 
        name: 'Demo User',
        password: 'demo' // Demo password
      });
      await user.save();
    } else if (!user) {
      return res.status(401).json({ error: 'Account not found. Please sign up first.' });
    }

    // Verify password if provided and user has a password
    if (user.password && password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else if (user.password && !password) {
      // User has password but none provided
      return res.status(401).json({ error: 'Password required' });
    }
    // Allow passwordless login for accounts without passwords (like demo)

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user (validate token)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;