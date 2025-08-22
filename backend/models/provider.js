const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  serviceType: { type: String, enum: ['mechanics', 'welders', 'engineers', 'other'], required: true },
  location: {
    city: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  radius: { type: Number, default: 50 }, // Max service radius in miles
  verified: { type: Boolean, default: false },
  subscriptionTier: { type: String, enum: ['none', 'basic', 'standard', 'premium'], default: 'none' }
});

module.exports = mongoose.model('Provider', providerSchema);
