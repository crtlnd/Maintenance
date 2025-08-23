const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

module.exports = () => {
  router.post(
    '/signup',
    [
      body('username').trim().notEmpty().withMessage('Username is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('consent').isBoolean().equals('true').withMessage('Consent is required')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { username, password, email, consent } = req.body;
        const existingUsers = await User.find().select('id');
        const newId = existingUsers.length > 0 ? Math.max(...existingUsers.map(u => u.id)) + 1 : 1;

        const customer = await stripe.customers.create({ email });
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: { token: 'tok_visa' }
        });
        await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
        await stripe.customers.update(customer.id, {
          invoice_settings: { default_payment_method: paymentMethod.id }
        });

        const user = await User.create({
          id: newId,
          username,
          password,
          email,
          consent,
          stripeCustomerId: customer.id,
          subscriptionTier: 'free'
        });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.send({ token });
      } catch (error) {
        console.error('Error signing up:', error);
        if (error.code === 11000) {
          return res.status(400).send({ error: 'Username or email already exists' });
        }
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/login',
    [
      body('username').trim().notEmpty().withMessage('Username is required'),
      body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).send({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.send({ token });
      } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
