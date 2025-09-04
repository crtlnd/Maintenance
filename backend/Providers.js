const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
const Provider = require('../models/provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Clear module cache for axios
delete require.cache[require.resolve('axios')];

module.exports = () => {
  const router = express.Router();
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  console.log('GOOGLE_MAPS_API_KEY in providers.js:', GOOGLE_PLACES_API_KEY);
  const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

  router.get(
    '/',
    [
      query('city').optional().trim(),
      query('serviceType')
        .optional()
        .isIn(['mechanics', 'welders', 'engineers', 'other'])
        .withMessage('Invalid service type'),
      query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      query('radius').optional().isInt({ min: 10, max: 50 }).withMessage('Radius must be between 10 and 50 miles'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log('Validation errors:', errors.array());
          return res.status(400).send({ errors: errors.array() });
        }
        const { city, serviceType = 'mechanics', lat, lng, radius = 50 } = req.query;
        const location = lat && lng ? `${lat},${lng}` : city ? `${city},TX` : null;
        if (!location) {
          console.log('Missing location');
          return res.status(400).json({ error: 'City or lat/lng is required' });
        }
        if (!GOOGLE_PLACES_API_KEY) {
          console.error('GOOGLE_MAPS_API_KEY is not defined');
          return res.status(500).send({ error: 'Server configuration error' });
        }
        console.log('Fetching providers from Google Places API:', { location, radius, serviceType });
        const serviceTextQueries = {
          mechanics: 'mechanics',
          welders: 'welders',
          engineers: 'engineering services',
          other: 'mechanics | welders | engineering services',
        };
        const radiusMeters = Math.min(parseFloat(radius) * 1609.34, 50000);
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType',
          },
        };
        console.log('Making API request with params:', {
          url: PLACES_API_URL,
          body: {
            textQuery: serviceTextQueries[serviceType] || 'mechanics',
            locationBias: {
              circle: {
                center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
                radius: radiusMeters,
              },
            },
            maxResultCount: 10,
          },
          headers: requestConfig.headers,
        });
        const response = await axios.post(
          PLACES_API_URL,
          {
            textQuery: serviceTextQueries[serviceType] || 'mechanics',
            locationBias: {
              circle: {
                center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
                radius: radiusMeters,
              },
            },
            maxResultCount: 10,
          },
          requestConfig
        ).catch(error => {
          console.error('Axios error:', error.response?.data || error.message);
          throw new Error('Failed to fetch from Google Places API');
        });
        const providers = (response.data.places || []).map((place) => ({
          placeId: place.id || place.displayName.text,
          name: place.displayName.text,
          description: place.primaryType || 'Service Provider',
          services: [place.primaryType] || [],
          address: place.formattedAddress || 'Unknown Address',
          phone: '',
          location: {
            lat: place.location.latitude,
            lng: place.location.longitude,
          },
          type: place.primaryType === 'car_repair' ? 'independent' : 'specialized',
          pricing: 'mid-range',
          rating: place.rating || 0,
          reviewCount: place.userRatingCount || 0,
          availability: 'business hours',
          specializations: [],
          certifications: [],
          website: '',
          verified: false,
          subscriptionTier: 'none',
        }));
        console.log('Providers fetched:', providers);
        const existingProviders = await Provider.find().select('id');
        const maxId = existingProviders.length > 0 ? Math.max(...existingProviders.map((p) => p.id || 0)) : 0;
        console.log('Max ID:', maxId);
        const savedProviders = await Promise.all(
          providers.map(async (provider, index) => {
            const providerData = {
              id: maxId + index + 1,
              placeId: provider.placeId,
              name: provider.name,
              description: provider.description,
              serviceType: serviceType.toLowerCase(),
              services: provider.services || [],
              address: provider.address || 'Unknown Address', // FIXED: Added missing closing quote
              phone: provider.phone || '',
              location: {
                city: city || location.split(',')[0],
                coordinates: {
                  type: 'Point',
                  coordinates: [provider.location.lng || parseFloat(lng) || 0, provider.location.lat || parseFloat(lat) || 0],
                },
                // Add direct lat/lng for easier frontend access
                lat: provider.location.lat || parseFloat(lat) || 0,
                lng: provider.location.lng || parseFloat(lng) || 0,
              },
              radius: parseFloat(radius),
              type: provider.type || 'independent',
              pricing: provider.pricing || 'mid-range',
              rating: provider.rating || 0,
              reviewCount: provider.reviewCount || 0,
              availability: provider.availability || 'business hours',
              specializations: provider.specializations || [],
              certifications: provider.certifications || [],
              website: provider.website || '',
              verified: false,
              subscriptionTier: 'none',
              // Add distance calculation
              distance: lat && lng ? calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                provider.location.lat || parseFloat(lat) || 0,
                provider.location.lng || parseFloat(lng) || 0
              ) : null,
            };
            console.log('Saving provider:', providerData);
            return await Provider.findOneAndUpdate(
              { placeId: provider.placeId },
              providerData,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          })
        );
        console.log('Saved providers:', savedProviders);
        if (lat && lng && radius) {
          const filteredProviders = savedProviders.filter((provider) => {
            const distance = calculateDistance(
              parseFloat(lat),
              parseFloat(lng),
              provider.location.coordinates.coordinates[1],
              provider.location.coordinates.coordinates[0]
            );
            console.log('Distance for provider', provider.name, ':', distance);
            return distance <= parseFloat(radius);
          });
          return res.send(filteredProviders);
        }
        res.send(savedProviders);
      } catch (error) {
        console.error('Error in /providers endpoint:', error.message, error.stack);
        res.status(500).send({ error: 'Failed to fetch providers' });
      }
    }
  );

  router.post(
    '/claim',
    [
      query('city').optional().trim(),
      query('serviceType')
        .optional()
        .isIn(['mechanics', 'welders', 'engineers', 'other'])
        .withMessage('Invalid service type'),
      query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      query('radius').optional().isInt({ min: 10, max: 50 }).withMessage('Radius must be between 10 and 50 miles'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log('Validation errors:', errors.array());
          return res.status(400).send({ errors: errors.array() });
        }
        const { placeId, businessLicense, subscriptionTier } = req.body;
        const provider = await Provider.findOne({ placeId });
        if (!provider) {
          return res.status(404).send({ error: 'Provider not found' });
        }
        const isLicenseValid = businessLicense.length > 0;
        if (!isLicenseValid) {
          return res.status(400).send({ error: 'Invalid business license' });
        }
        provider.verified = true;
        provider.subscriptionTier = subscriptionTier;
        provider.updatedAt = Date.now();
        await provider.save();
        res.send({ message: 'Profile claimed and verified successfully', provider });
      } catch (error) {
        console.error('Error claiming provider:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  router.post(
    '/subscribe',
    [
      body('placeId').notEmpty().withMessage('placeId is required'),
      body('tier')
        .isIn(['verified', 'contact', 'promoted'])
        .withMessage('Invalid subscription tier'),
      body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log('Validation errors:', errors.array());
          return res.status(400).send({ errors: errors.array() });
        }
        const { placeId, tier, paymentMethodId } = req.body;
        const provider = await Provider.findOne({ placeId });
        if (!provider) {
          return res.status(404).send({ error: 'Provider not found' });
        }
        const prices = {
          verified: 'price_1S0lDuGi9H80HINU4TkumgNG',
          contact: 'price_1S0lI2Gi9H80HINUbLa9wOvx',
          promoted: 'price_1S0lKPGi9H80HINUE7itJVlP',
        };
        let customer;
        if (provider.stripeCustomerId) {
          customer = await stripe.customers.retrieve(provider.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: `provider_${placeId}@example.com`,
            payment_method: paymentMethodId,
            invoice_settings: { default_payment_method: paymentMethodId },
          });
        }
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: prices[tier] }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
        const updatedProvider = await Provider.findOneAndUpdate(
          { placeId },
          {
            $set: {
              stripeCustomerId: customer.id,
              stripeSubscriptionId: subscription.id,
              subscriptionTier: tier,
              updatedAt: new Date(),
            },
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

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return router;
};
