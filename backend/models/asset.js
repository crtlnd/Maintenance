// backend/models/asset.js - Enhanced version
const mongoose = require('mongoose');

const fmeaSchema = new mongoose.Schema({
  assetId: { type: Number, required: true },
  failureMode: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  occurrence: { type: Number, required: true, min: 1, max: 10 },
  detection: { type: Number, required: true, min: 1, max: 10 },
  rpn: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const rcaSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  whys: { type: [String], required: true, validate: [v => v.length === 5, 'Exactly 5 whys are required'] },
  fishbone: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

const rcmSchema = new mongoose.Schema({
  task: { type: String, required: true },
  interval: { type: Number, required: true, min: 1 },
  criticality: { type: String, enum: ['high', 'medium', 'low'], required: true },
  timestamp: { type: Date, default: Date.now },
});

// Enhanced maintenance task schema
const maintenanceTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['preventive', 'corrective', 'predictive', 'inspection'], default: 'preventive' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  assignedTo: { type: String },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  dueDate: { type: Date },
  completedDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Enhanced specifications schema
const specificationsSchema = new mongoose.Schema({
  engine: {
    power: { type: String },
    displacement: { type: String },
    fuelType: { type: String },
    fuelCapacity: { type: String }
  },
  hydraulics: {
    systemPressure: { type: String },
    pumpFlow: { type: String },
    tankCapacity: { type: String }
  },
  dimensions: {
    length: { type: String },
    width: { type: String },
    height: { type: String },
    weight: { type: String }
  },
  performance: {
    maxSpeed: { type: String },
    liftCapacity: { type: String },
    operatingWeight: { type: String }
  }
}, { _id: false });

// Enhanced asset schema
const assetSchema = new mongoose.Schema({
  // Existing basic fields
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  organization: { type: String, required: true },
  subAsset: { type: String },
  industry: { type: String, enum: ['oil/gas', 'construction', 'manufacturing', 'other'], default: 'other' },
  status: { type: String, enum: ['operational', 'maintenance', 'down', 'retired'], default: 'operational' },
  condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' },
  userId: { type: Number, required: true },

  // Enhanced fields for rich asset data
  type: { type: String, required: true }, // excavator, truck, generator, etc.
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  yearManufactured: { type: Number },

  // Operating information
  operatingHours: { type: Number, default: 0 },
  mileage: { type: Number },
  lastServiceDate: { type: Date },
  nextServiceDate: { type: Date },
  nextDueDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },

  // Asset specifications
  specifications: specificationsSchema,

  // Maintenance information
  maintenanceTasks: [maintenanceTaskSchema],
  maintenanceHistory: [{
    date: { type: Date, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    cost: { type: Number },
    performedBy: { type: String },
    partsUsed: [{
      name: String,
      quantity: Number,
      cost: Number
    }]
  }],

  // Asset images and documents
  images: [{
    url: { type: String, required: true },
    caption: { type: String },
    uploadDate: { type: Date, default: Date.now }
  }],

  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String }, // manual, warranty, inspection, etc.
    uploadDate: { type: Date, default: Date.now }
  }],

  // Financial information
  purchasePrice: { type: Number },
  purchaseDate: { type: Date },
  warrantyExpiration: { type: Date },
  insurancePolicy: { type: String },

  // Location tracking
  currentLocation: {
    address: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },

  // Alert and notification settings
  alerts: [{
    type: { type: String, required: true }, // maintenance_due, low_hours, etc.
    threshold: { type: Number },
    enabled: { type: Boolean, default: true }
  }],

  // Existing analysis schemas
  fmea: [fmeaSchema],
  rca: [rcaSchema],
  rcm: [rcmSchema],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
assetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-findOneAndUpdate middleware to update timestamps
assetSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Virtual for asset age
assetSchema.virtual('age').get(function() {
  if (this.yearManufactured) {
    return new Date().getFullYear() - this.yearManufactured;
  }
  return null;
});

// Virtual for days until next service
assetSchema.virtual('daysUntilService').get(function() {
  if (this.nextServiceDate) {
    const today = new Date();
    const diffTime = this.nextServiceDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtuals are included in JSON output
assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);
