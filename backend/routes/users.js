const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
      body('notificationPreferences.sms').optional().isBoolean().withMessage('SMS preference must be a boolean')
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
      body('tier').isIn(['free', 'pro', 'ai-powered']).withMessage('Invalid subscription tier')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { tier } = req.body;
        const user = await User.findOne({ id: req.auth.userId });
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (tier === 'free') {
          const updatedUser = await User.findOneAndUpdate(
            { id: req.auth.userId },
            { $set: { subscriptionTier: 'free', stripeSubscriptionId: null } },
            { new: true }
          );
          return res.send(updatedUser);
        }
        const prices = {
          pro: 'price_1RzM63Gi9H80HINUKvF3JHa7', // Replace with actual Pro Price ID ($20/month)
          'ai-powered': 'price_1RzM7EGi9H80HINUqUNUqOcd' // Replace with actual AI-Powered Price ID ($50/month)
        };
        let customer;
        if (user.stripeCustomerId) {
          customer = await stripe.customers.retrieve(user.stripeCustomerId);
        } else {
          return res.status(400).send({ error: 'No payment method on file. Please update your account.' });
        }
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: prices[tier] }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent']
        });
        const updatedUser = await User.findOneAndUpdate(
          { id: req.auth.userId },
          {
            $set: {
              stripeSubscriptionId: subscription.id,
              subscriptionTier: tier
            }
          },
          { new: true }
        );
        res.send(updatedUser);
      } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
