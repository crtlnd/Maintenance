const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
const Provider = require('../models/provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const router = express.Router();
// FIX: Use the correct environment variable name
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Changed from GOOGLE_PLACES_API_KEY
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
    query('radius').optional().isInt({ min: 10, max: 50 }).withMessage('Radius must be between 10 and 50 miles'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).send({ errors: errors.array() });
      }
      // FIX: Don't default to Midland - require lat/lng from frontend
      const { city, serviceType = 'mechanics', lat, lng, radius = '25', limit = 10 } = req.query;
      // Require lat/lng coordinates
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      console.log('=== GOOGLE PLACES API REQUEST ===');
      console.log('API Key exists:', !!GOOGLE_PLACES_API_KEY);
      console.log('API Key first 10 chars:', GOOGLE_PLACES_API_KEY?.substring(0, 10));
      console.log('Request params:', { lat, lng, radius, serviceType, limit });
      // Map service types to Google Places API text queries
      const serviceTextQueries = {
        mechanics: 'auto repair shop mechanics',
        welders: 'welding services fabrication',
        engineers: 'engineering consulting services',
        electrical: 'electrical contractor repair',
        hydraulics: 'hydraulic repair services',
        all: 'auto repair welding engineering electrical hydraulic services',
      };
      const radiusMeters = Math.min(parseFloat(radius) * 1609.34, 50000); // Cap at ~31 miles
      const textQuery = serviceTextQueries[serviceType] || serviceTextQueries.mechanics;
      console.log('Google Places request:', {
        url: PLACES_API_URL,
        textQuery,
        center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        radius: radiusMeters,
        maxResultCount: Math.min(parseInt(limit), 20)
      });
      // Check API key before making request
      if (!GOOGLE_PLACES_API_KEY) {
        console.error('Google Places API key is missing!');
        return res.status(500).json({ error: 'Server configuration error: Missing API key' });
      }
      // Make request to Google Places API
      const response = await axios.post(
        PLACES_API_URL,
        {
          textQuery,
          locationBias: {
            circle: {
              center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
              radius: radiusMeters,
            },
          },
          maxResultCount: Math.min(parseInt(limit), 20),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.businessStatus',
          },
        }
      );
      console.log('=== GOOGLE PLACES API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data keys:', Object.keys(response.data || {}));
      console.log('Places count:', response.data?.places?.length || 0);
      // Log first place for debugging
      if (response.data?.places?.length > 0) {
        console.log('First place sample:', JSON.stringify(response.data.places[0], null, 2));
      } else {
        console.log('No places returned from Google Places API');
        console.log('Full response:', JSON.stringify(response.data, null, 2));
      }
      const places = response.data.places || [];
      // Transform Google Places data to our format
      const providers = places.map((place, index) => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          place.location?.latitude || 0,
          place.location?.longitude || 0
        );
        return {
          placeId: place.id || `place_${index}`,
          name: place.displayName?.text || 'Unknown Business',
          description: place.primaryType || 'Service Provider',
          services: place.primaryType ? [place.primaryType] : ['general_contractor'],
          address: place.formattedAddress || 'Address not available',
          phone: '', // Requires place details call
          location: {
            lat: place.location?.latitude || parseFloat(lat),
            lng: place.location?.longitude || parseFloat(lng),
            coordinates: {
              type: 'Point',
              coordinates: [
                place.location?.longitude || parseFloat(lng),
                place.location?.latitude || parseFloat(lat)
              ]
            }
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
          distance: distance,
          businessStatus: place.businessStatus || 'OPERATIONAL'
        };
      });
      console.log('=== PROCESSED PROVIDERS ===');
      console.log('Processed providers count:', providers.length);
      providers.forEach((provider, index) => {
        console.log(`Provider ${index + 1}:`, {
          name: provider.name,
          address: provider.address,
          distance: provider.distance,
          location: provider.location
        });
      });
      // Filter by distance and business status
      const filteredProviders = providers.filter(provider => {
        const withinRadius = provider.distance <= parseFloat(radius);
        const isOperational = provider.businessStatus === 'OPERATIONAL';
        return withinRadius && isOperational;
      });
      console.log('Filtered providers count:', filteredProviders.length);
      // Save to MongoDB (optional - for caching)
      const savedProviders = [];
      for (const provider of filteredProviders.slice(0, parseInt(limit))) {
        try {
          const savedProvider = await Provider.findOneAndUpdate(
            { placeId: provider.placeId },
            {
              ...provider,
              serviceType: serviceType.toLowerCase(),
              radius: parseFloat(radius),
              updatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          savedProviders.push(savedProvider);
        } catch (saveError) {
          console.error('Error saving provider:', provider.name, saveError.message);
          // Continue with next provider instead of failing entire request
        }
      }
      console.log('=== FINAL RESPONSE ===');
      console.log('Returning providers count:', savedProviders.length);
      res.json(savedProviders);
    } catch (error) {
      console.error('=== ERROR IN PROVIDERS ENDPOINT ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      // Return more specific error information
      if (error.response?.status === 403) {
        res.status(500).json({ error: 'Google Places API key permission denied. Check API key and enabled services.' });
      } else if (error.response?.status === 400) {
        res.status(500).json({ error: 'Invalid request to Google Places API. Check request format.' });
      } else {
        res.status(500).json({ error: 'Failed to fetch providers from Google Places API' });
      }
    }
  }
);

// Add handler for /claim (expand as needed)
router.post('/claim', async (req, res) => {
  // TODO: Implement claim logic here
  res.status(501).json({ message: '/claim route not implemented yet' });
});

// Add handler for /subscribe (expand as needed)
router.post('/subscribe', async (req, res) => {
  // TODO: Implement subscribe logic here
  res.status(501).json({ message: '/subscribe route not implemented yet' });
});

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
