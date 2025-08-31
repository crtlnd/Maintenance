const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  placeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  serviceType: { type: String, enum: ['mechanics', 'welders', 'engineers', 'other'], required: true },
  services: [{ type: String }],
  address: { type: String, required: true },
  phone: { type: String, default: '' },
  location: {
    city: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  radius: { type: Number, default: 50 },
  type: { type: String, enum: ['independent', 'specialized'], default: 'independent' },
  pricing: { type: String, enum: ['budget', 'mid-range', 'premium'], default: 'mid-range' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availability: { type: String, default: 'business hours' },
  specializations: [{ type: String }],
  certifications: [{ type: String }],
  website: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  subscriptionTier: {
    type: String,
    enum: ['none', 'verified', 'contact', 'promoted'],
    default: 'none',
  }, // $20 (verified: badge), $50 (contact: user contact), $500 (promoted: promoted listing)
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Geospatial index for location-based queries
providerSchema.index({ 'location.coordinates': '2dsphere' });

// Update timestamp on save
providerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Provider', providerSchema);
