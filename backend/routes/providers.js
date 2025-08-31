const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
const Provider = require('../models/provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const router = express.Router();
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
router.get(
  '/',
  [
    query('city').optional().trim(),
    query('serviceType')
      .optional()
      .isIn(['mechanics', 'welders', 'engineers', 'electrical', 'hydraulics', 'all'])
      .withMessage('Invalid service type'),
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    query('radius').optional().isInt({ min: 10, max: 31 }).withMessage('Radius must be between 10 and 31 miles'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'), // Added limit validation
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).send({ errors: errors.array() });
      }
      const { city = 'Midland,TX', serviceType = 'all', lat = '31.9973', lng = '-102.0779', radius = '31', limit = 10 } = req.query; // Default limit to 10
      const location = lat && lng ? `${lat},${lng}` : city ? `${city},TX` : '31.9973,-102.0779';
      // Map service types to Google Places API text queries
      const serviceTextQueries = {
        mechanics: 'mechanics',
        welders: 'welders',
        engineers: 'engineering services',
        electrical: 'electrical repair',
        hydraulics: 'hydraulic repair',
        all: 'mechanics | welders | engineering services | electrical repair | hydraulic repair',
      };
      // Cap radius at 31 miles (approximately 50,000 meters)
      const maxRadiusMeters = 50000;
      const radiusMeters = Math.min(parseFloat(radius) * 1609.34, maxRadiusMeters);
      // Fetch providers from Google Places API (New)
      console.log('Google Places API Key:', process.env.GOOGLE_PLACES_API_KEY);
      console.log('Fetching providers from Google Places API:', { location, radius: radiusMeters, serviceType });
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
          maxResultCount: Math.min(parseInt(limit), 20), // Respect limit, cap at 20 for Google Places API
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType',
          },
        }
      ).catch(error => {
        console.error('Axios error:', error.response?.data || error.message);
        throw new Error('Failed to fetch from Google Places API');
      });
      const providers = (response.data.places || []).map((place) => ({
        placeId: place.id || place.displayName.text, // Fallback to displayName if id is missing
        name: place.displayName.text,
        description: place.primaryType || 'Service Provider',
        services: [place.primaryType] || [],
        address: place.formattedAddress || 'Unknown Address',
        phone: '', // Requires place/details call
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
        },
        type: place.primaryType === 'car_repair' ? 'independent' : 'specialized',
        pricing: 'mid-range', // Default
        rating: place.rating || 0,
        reviewCount: place.userRatingCount || 0,
        availability: 'business hours', // Requires place/details call
        specializations: [],
        certifications: [],
        website: '',
        verified: false,
        subscriptionTier: 'none',
      }));
      console.log('Providers fetched from Google Places:', providers);
      // Save or update providers in MongoDB
      const existingProviders = await Provider.find().select('id').catch(error => {
        console.error('MongoDB find error:', error.message);
        throw new Error('Failed to query MongoDB');
      });
      const maxId = existingProviders.length > 0 ? Math.max(...existingProviders.map((p) => p.id || 0)) : 0;
      console.log('Max ID:', maxId);
      const savedProviders = await Promise.all(
        providers.slice(0, parseInt(limit)).map(async (provider, index) => { // Apply limit to MongoDB save
          const providerData = {
            id: maxId + index + 1,
            placeId: provider.placeId,
            name: provider.name,
            description: provider.description,
            serviceType: serviceType.toLowerCase(),
            services: provider.services,
            address: provider.address,
            phone: provider.phone,
            location: {
              city: city.split(',')[0] || 'Midland',
              coordinates: {
                type: 'Point',
                coordinates: [provider.location.lng, provider.location.lat],
              },
            },
            radius: parseFloat(radius),
            type: provider.type,
            pricing: provider.pricing,
            rating: provider.rating,
            reviewCount: provider.reviewCount,
            availability: provider.availability,
            specializations: provider.specializations,
            certifications: provider.certifications,
            website: provider.website,
            verified: provider.verified,
            subscriptionTier: provider.subscriptionTier,
          };
          console.log('Saving provider:', providerData);
          return await Provider.findOneAndUpdate(
            { placeId: provider.placeId },
            providerData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).catch(error => {
            console.error('MongoDB save error for provider:', provider.name, error.message);
            throw new Error('Failed to save provider to MongoDB');
          });
        })
      );
      console.log('Saved providers:', savedProviders);
      // Filter providers by distance if lat/lng provided
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
// POST /api/providers/claim
router.post(
  '/claim',
  [
    body('placeId').notEmpty().withMessage('placeId is required'),
    body('businessLicense').notEmpty().withMessage('Business license is required'),
    body('subscriptionTier')
      .isIn(['verified', 'contact', 'promoted'])
      .withMessage('Invalid subscription tier'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).send({ errors: errors.array() });
      }
      const { placeId, businessLicense, subscriptionTier } = req.body;
      console.log('Claiming provider:', { placeId, businessLicense, subscriptionTier });
      const provider = await Provider.findOne({ placeId });
      if (!provider) {
        console.log('Provider not found for placeId:', placeId);
        return res.status(404).send({ error: 'Provider not found' });
      }
      const isLicenseValid = businessLicense.length > 0; // Placeholder
      if (!isLicenseValid) {
        return res.status(400).send({ error: 'Invalid business license' });
      }
      provider.verified = true;
      provider.subscriptionTier = subscriptionTier;
      provider.updatedAt = new Date();
      await provider.save();
      console.log('Provider claimed:', provider);
      res.send({ message: 'Profile claimed and verified successfully', provider });
    } catch (error) {
      console.error('Error claiming provider:', error.message, error.stack);
      res.status(500).send({ error: 'Server error' });
    }
  }
);
// POST /api/providers/subscribe
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
      console.log('Subscribing provider:', { placeId, tier, paymentMethodId });
      const provider = await Provider.findOne({ placeId });
      if (!provider) {
        console.log('Provider not found for placeId:', placeId);
        return res.status(404).send({ error: 'Provider not found' });
      }
      const prices = {
        verified: 'price_1S0lDuGi9H80HINU4TkumgNG', // $20/month for Provider Verified
        contact: 'price_1S0lI2Gi9H80HINUbLa9wOvx', // $50/month for Provider Premium
        promoted: 'price_1S0lKPGi9H80HINUE7itJVlP', // $500/month for Provider Promoted
      };
      let customer;
      if (provider.stripeCustomerId) {
        console.log('Retrieving existing customer:', provider.stripeCustomerId);
        customer = await stripe.customers.retrieve(provider.stripeCustomerId);
      } else {
        console.log('Creating new customer for:', `provider_${placeId}@example.com`);
        customer = await stripe.customers.create({
          email: `provider_${placeId}@example.com`,
          payment_method: paymentMethodId,
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }
      console.log('Creating subscription for customer:', customer.id);
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: prices[tier] }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      const updateData = {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        subscriptionTier: tier,
        updatedAt: new Date(),
      };
      console.log('Updating provider with:', updateData);
      const updatedProvider = await Provider.findOneAndUpdate(
        { placeId },
        { $set: updateData },
        { new: true }
      );
      console.log('Updated provider:', updatedProvider);
      res.send(updatedProvider);
    } catch (error) {
      console.error('Error creating subscription:', error.message, error.stack);
      res.status(500).send({ error: 'Server error' });
    }
  }
);
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
module.exports = () => router;
