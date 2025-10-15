const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Register user (simplified - no password for demo)
router.post('/register', validateUser, async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
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

// Login user (simplified - no password verification for demo)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    let user = await User.findOne({ email });

    // Create user if doesn't exist (for demo purposes)
    if (!user) {
      user = new User({ 
        email, 
        name: email.split('@')[0] // Use email prefix as name
      });
      await user.save();
    }

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

module.exports = router;