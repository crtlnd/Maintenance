const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const User = require('../models/user');
const Provider = require('../models/provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = () => {
  // Middleware to check if user is admin
  const isAdmin = async (req, res, next) => {
    try {
      const user = await User.findOne({ id: req.auth.userId });
      if (!user || user.username !== 'admin') {
        return res.status(403).send({ error: 'Admin access required' });
      }
      next();
    } catch (error) {
      console.error('Error checking admin status:', error);
      res.status(500).send({ error: 'Server error' });
    }
  };

  router.get('/users', isAdmin, async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.send(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.get('/providers', isAdmin, async (req, res) => {
    try {
      const providers = await Provider.find();
      res.send(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.get('/payments/:providerId', isAdmin, [
    param('providerId').isInt().withMessage('Provider ID must be an integer')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const providerId = parseInt(req.params.providerId);
      const provider = await Provider.findOne({ id: providerId });
      if (!provider || !provider.stripeSubscriptionId) {
        return res.status(404).send({ error: 'Provider or subscription not found' });
      }
      const subscription = await stripe.subscriptions.retrieve(provider.stripeSubscriptionId);
      res.send(subscription);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.put('/matching-logic', isAdmin, [
    body('maxRadius').optional().isInt({ min: 10, max: 100 }).withMessage('Max radius must be between 10 and 100 miles')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { maxRadius } = req.body;
      // Placeholder: Store matching logic config (e.g., in a config collection or file)
      const config = { maxRadius: maxRadius || 50 };
      res.send({ message: 'Matching logic updated', config });
    } catch (error) {
      console.error('Error updating matching logic:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  return router;
};
