// backend/models/asset.js - Enhanced version with comprehensive RCA schema and organization support
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

// UPDATED: Comprehensive RCA schema to match frontend structure
const rcaSchema = new mongoose.Schema({
  assetId: { type: Number, required: true },
  failureDate: { type: String, required: true },
  problemDescription: { type: String, required: true },
  immediateActions: { type: String, required: true },
  rootCauses: { type: String },
  correctiveActions: { type: String, required: true },
  preventiveActions: { type: String, required: true },
  responsible: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Closed'], default: 'In Progress' },
  cost: { type: Number, default: 0 },
  fiveWhys: {
    problem: String,
    why1: { question: String, answer: String },
    why2: { question: String, answer: String },
    why3: { question: String, answer: String },
    why4: { question: String, answer: String },
    why5: { question: String, answer: String },
    rootCause: String
  },
  fishboneDiagram: {
    problem: String,
    categories: [{
      category: String,
      causes: [String]
    }]
  },
  timestamp: { type: Date, default: Date.now },
  createdBy: { type: String }
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
  userId: { type: String, required: true },

  // Organization association (NEW)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },

  // Track who created and modified the asset (NEW)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Enhanced fields for rich asset data
  type: { type: String, required: true }, // excavator, truck, generator, etc.
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple null values
  },
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

  // Analysis schemas - UPDATED RCA schema
  fmea: [fmeaSchema],
  rca: [rcaSchema],
  rcm: [rcmSchema],

  // Activity tracking (NEW)
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
assetSchema.index({ userId: 1 });
assetSchema.index({ organizationId: 1 }); // NEW
assetSchema.index({ status: 1 });
assetSchema.index({ condition: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ location: 1 });
assetSchema.index({ nextServiceDate: 1 });
assetSchema.index({ serialNumber: 1 }, { sparse: true, unique: true });

// Compound indexes for common queries (NEW)
assetSchema.index({ organizationId: 1, status: 1 });
assetSchema.index({ organizationId: 1, type: 1 });
assetSchema.index({ organizationId: 1, location: 1 });
assetSchema.index({ userId: 1, status: 1 });

// Pre-save middleware to update timestamps
assetSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Set lastModifiedBy if not already set (NEW)
  if (this.isModified() && !this.lastModifiedBy) {
    this.lastModifiedBy = this.userId;
  }

  next();
});

// Pre-findOneAndUpdate middleware to update timestamps
assetSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Instance methods (NEW)
assetSchema.methods.isMaintenanceDue = function() {
  if (!this.nextServiceDate) return false;
  return new Date() >= this.nextServiceDate;
};

assetSchema.methods.isMaintenanceOverdue = function() {
  if (!this.nextServiceDate) return false;
  const overdueDays = 7; // 7 days past due
  const overdueDate = new Date(this.nextServiceDate.getTime() + (overdueDays * 24 * 60 * 60 * 1000));
  return new Date() > overdueDate;
};

assetSchema.methods.getDaysUntilMaintenance = function() {
  if (!this.nextServiceDate) return null;
  const diffTime = this.nextServiceDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static methods for organization queries (NEW)
assetSchema.statics.findByOrganization = function(organizationId, filter = {}) {
  return this.find({
    organizationId,
    isActive: true,
    ...filter
  });
};

assetSchema.statics.findMaintenanceDue = function(organizationId, days = 30) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);

  return this.find({
    organizationId,
    isActive: true,
    nextServiceDate: { $lte: dueDate }
  });
};

assetSchema.statics.findByLocation = function(organizationId, location) {
  return this.find({
    organizationId,
    location,
    isActive: true
  });
};

assetSchema.statics.findByType = function(organizationId, type) {
  return this.find({
    organizationId,
    type,
    isActive: true
  });
};

assetSchema.statics.getMaintenanceStats = function(organizationId) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        operational: { $sum: { $cond: [{ $eq: ['$status', 'operational'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
        down: { $sum: { $cond: [{ $eq: ['$status', 'down'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$nextServiceDate', null] },
                { $lt: ['$nextServiceDate', new Date()] }
              ]},
              1, 0
            ]
          }
        }
      }
    }
  ]);
};

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
