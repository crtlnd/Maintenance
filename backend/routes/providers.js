const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Provider = require('../models/provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = () => {
  router.post(
    '/',
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('serviceType').isIn(['mechanics', 'welders', 'engineers', 'other']).withMessage('Invalid service type'),
      body('location.city').trim().notEmpty().withMessage('City is required'),
      body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      body('radius').optional().isInt({ min: 10, max: 50 }).withMessage('Radius must be between 10 and 50 miles')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { name, serviceType, location, radius } = req.body;
        const existingProviders = await Provider.find().select('id');
        const newId = existingProviders.length > 0 ? Math.max(...existingProviders.map(p => p.id)) + 1 : 1;
        const newProvider = await Provider.create({
          id: newId,
          name,
          serviceType,
          location,
          radius
        });
        res.send(newProvider);
      } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.get(
    '/',
    [
      query('city').optional().trim(),
      query('serviceType').optional().isIn(['mechanics', 'welders', 'engineers', 'other']).withMessage('Invalid service type'),
      query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      query('radius').optional().isInt({ min: 10, max: 50 }).withMessage('Radius must be between 10 and 50 miles')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { city, serviceType, lat, lng, radius } = req.query;
        const query = {};
        if (city) query['location.city'] = city;
        if (serviceType) query.serviceType = serviceType;
        const providers = await Provider.find(query);
        if (lat && lng && radius) {
          const filteredProviders = providers.filter(provider => {
            const distance = calculateDistance(
              parseFloat(lat),
              parseFloat(lng),
              provider.location.coordinates.lat,
              provider.location.coordinates.lng
            );
            return distance <= (provider.radius || parseInt(radius));
          });
          return res.send(filteredProviders);
        }
        res.send(providers);
      } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/claim',
    [
      body('providerId').isInt().withMessage('Provider ID must be an integer')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { providerId } = req.body;
        const provider = await Provider.findOneAndUpdate(
          { id: providerId },
          { $set: { verified: false } },
          { new: true }
        );
        if (!provider) {
          return res.status(404).send({ error: 'Provider not found' });
        }
        res.send(provider);
      } catch (error) {
        console.error('Error claiming provider:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/verify/:providerId',
    [param('providerId').isInt().withMessage('Provider ID must be an integer')],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const providerId = parseInt(req.params.providerId);
        const provider = await Provider.findOneAndUpdate(
          { id: providerId },
          { $set: { verified: true } },
          { new: true }
        );
        if (!provider) {
          return res.status(404).send({ error: 'Provider not found' });
        }
        res.send(provider);
      } catch (error) {
        console.error('Error verifying provider:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/subscribe',
    [
      body('providerId').isInt().withMessage('Provider ID must be an integer'),
      body('tier').isIn(['basic', 'standard', 'premium']).withMessage('Invalid subscription tier')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { providerId, tier } = req.body;
        const provider = await Provider.findOne({ id: providerId });
        if (!provider) {
          return res.status(404).send({ error: 'Provider not found' });
        }
        const prices = {
          basic: 'price_1Rz5VzGi9H80HINU19RRxu6V', // $10/month
          standard: 'price_1Rz5WBGi9H80HINUdQFvPIvm', // $25/month
          premium: 'price_1Rz5XEGi9H80HINUZQ4Cb0fP' // $100/month
        };
        let customer;
        if (provider.stripeCustomerId) {
          customer = await stripe.customers.retrieve(provider.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: `provider${providerId}@example.com`
          });
          const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: { token: 'tok_visa' }
          });
          await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
          await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethod.id }
          });
        }
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: prices[tier] }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent']
        });
        const updatedProvider = await Provider.findOneAndUpdate(
          { id: providerId },
          {
            $set: {
              stripeCustomerId: customer.id,
              stripeSubscriptionId: subscription.id,
              subscriptionTier: tier
            }
          },
          { new: true }
        );
        res.send(updatedProvider);
      } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  // Haversine formula for distance calculation
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return router;
};
