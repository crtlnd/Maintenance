const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const router = express.Router();

module.exports = () => {
  router.post('/signup', async (req, res, next) => {
    console.log('Entering /signup handler');
    try {
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));

      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        console.error('MongoDB not connected:', mongoose.connection.readyState);
        return res.status(500).json({ error: 'Database connection error' });
      }
      console.log('MongoDB connection state:', mongoose.connection.readyState);

      // Destructure with defaults
      const { password, email, firstName, lastName, company, role } = req.body;
      const username = req.body.username || email;
      const consent = req.body.consent !== undefined ? req.body.consent : true;
      const userType = req.body.userType || 'customer';

      // Manual validation
      if (!username || !password || !email || !firstName || !lastName || !company || !role) {
        console.log('Manual validation failed: Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (password.length < 6) {
        console.log('Manual validation failed: Password too short');
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log('Manual validation failed: Invalid email');
        return res.status(400).json({ error: 'Valid email is required' });
      }
      console.log('Manual validation passed');

      console.log('Checking for existing user:', { email, username });
      try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] }).maxTimeMS(5000);
        if (existingUser) {
          console.log('User already exists:', existingUser.email);
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.log('No existing user found');
      } catch (findError) {
        console.error('Error checking existing user:', findError.message, findError.stack);
        return res.status(500).json({ error: 'Failed to check existing user' });
      }

      console.log('Creating new user document');
      const user = new User({
        username,
        password, // Handled by pre-save hook
        email,
        firstName,
        lastName,
        company,
        role,
        consent,
        subscriptionTier: 'Basic',
        userType,
      });
      console.log('Saving user:', user.email);
      try {
        await user.save({ maxTimeMS: 5000 });
        console.log('User saved successfully:', user._id);
      } catch (saveError) {
        console.error('Error saving user:', saveError.message, saveError.stack);
        return res.status(500).json({ error: 'Failed to save user' });
      }

      console.log('Generating JWT token with userId:', user._id);
      try {
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not defined');
          return res.status(500).json({ error: 'Server configuration error' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log('JWT token generated successfully:', token.substring(0, 10) + '...');
        console.log('Sending response with token for user:', user._id);
        return res.status(200).json({ token, user });
      } catch (jwtError) {
        console.error('Error generating JWT:', jwtError.message, jwtError.stack);
        return res.status(500).json({ error: 'Failed to generate token' });
      }
    } catch (error) {
      console.error('Error signing up:', error.message, error.stack);
      return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    } finally {
      console.log('Exiting /signup handler');
    }
  });

  router.post('/login', async (req, res, next) => {
    console.log('Entering /login handler');
    try {
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));
      const { email, password } = req.body;
      if (!email || !password) {
        console.log('Manual validation failed: Missing email or password');
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('Finding user:', email);
      const user = await User.findOne({ email }).maxTimeMS(5000);
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('Comparing password for:', email);
      if (!(await bcrypt.compare(password, user.password))) {
        console.log('Password mismatch for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user.lastLogin = new Date();
      console.log('Updating lastLogin for:', user._id);
      await user.save({ maxTimeMS: 5000 });

      console.log('User logged in:', user._id);
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      return res.status(200).json({ token, user });
    } catch (error) {
      console.error('Error logging in:', error.message, error.stack);
      return res.status(500).json({ error: 'Server error' });
    } finally {
      console.log('Exiting /login handler');
    }
  });

  return router;
};
