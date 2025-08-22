const mongoose = require('mongoose');

const fmeaSchema = new mongoose.Schema({
  assetId: { type: Number, required: true },
  failureMode: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  occurrence: { type: Number, required: true, min: 1, max: 10 },
  detection: { type: Number, required: true, min: 1, max: 10 },
  rpn: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const rcaSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  whys: { type: [String], required: true, validate: [v => v.length === 5, 'Exactly 5 whys are required'] },
  fishbone: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

const rcmSchema = new mongoose.Schema({
  task: { type: String, required: true },
  interval: { type: Number, required: true, min: 1 },
  criticality: { type: String, enum: ['high', 'medium', 'low'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const assetSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  organization: { type: String, required: true },
  subAsset: { type: String },
  industry: { type: String, enum: ['oil/gas', 'construction', 'manufacturing', 'other'], default: 'other' },
  status: { type: String, enum: ['active', 'overdue', 'maintenance'], default: 'active' },
  nextDueDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  condition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
  maintenanceHistory: [{ type: String }],
  fmea: [fmeaSchema],
  rca: [rcaSchema],
  rcm: [rcmSchema]
});

module.exports = mongoose.model('Asset', assetSchema);
