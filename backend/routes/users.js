const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

module.exports = () => {
  router.get('/profile', async (req, res) => {
    try {
      const user = await User.findOne({ id: req.auth.userId }).populate('assets');
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.put(
    '/profile',
    [
      body('notificationPreferences.email').optional().isBoolean().withMessage('Email preference must be a boolean'),
      body('notificationPreferences.sms').optional().isBoolean().withMessage('SMS preference must be a boolean'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { notificationPreferences } = req.body;
        const user = await User.findOneAndUpdate(
          { id: req.auth.userId },
          { $set: { notificationPreferences } },
          { new: true }
        );
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/subscribe',
    [
      body('plan').isIn(['Basic', 'Professional', 'Annual']).withMessage('Invalid subscription plan'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { plan } = req.body;
        const user = await User.findOne({ id: req.auth.userId });
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }

        const prices = {
          Basic: 'price_1S2E1zGi9H80HINUlSIJ5u1v', // Replace with actual Basic Price ID ($20/month)
          Professional: 'price_1S2E2rGi9H80HINU3SVfZwFn', // Replace with actual Professional Price ID ($50/month)
          Annual: 'price_1S2E3nGi9H80HINU7PLjhbQs', // Replace with actual Annual Price ID ($449/year)
        };

        // Call the subscriptions endpoint to create a checkout session
        const response = await fetch('http://localhost:3000/api/subscriptions/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: prices[plan], email: user.email, plan }),
        });

        const { url } = await response.json();
        if (!url) {
          return res.status(500).send({ error: 'Failed to create checkout session' });
        }

        res.send({ url }); // Frontend will redirect to this URL
      } catch (error) {
        console.error('Error initiating subscription:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
