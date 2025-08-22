const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Provider = require('../models/provider');

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

  // Haversine formula to calculate distance between two points (in miles)
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
