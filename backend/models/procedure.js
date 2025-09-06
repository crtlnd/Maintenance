const mongoose = require('mongoose');

const procedureStepSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instruction: {
    type: String,
    required: true
  },
  expandedDetails: {
    type: String
  }
});

const procedureSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  assetId: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['standard', 'inspection', 'repair', 'custom'],
    required: true
  },
  priority: {
    type: String,
    enum: ['urgent', 'important'],
    required: true
  },
  interval: {
    type: String
  },
  estimatedTime: {
    type: String,
    required: true
  },
  rpnTriggered: {
    type: Boolean,
    default: false
  },
  rpnScore: {
    type: Number
  },
  component: {
    type: String
  },
  tools: [{
    type: String
  }],
  materials: [{
    type: String
  }],
  people: [{
    type: String
  }],
  safety: [{
    type: String
  }],
  steps: [procedureStepSchema],
  autoScheduled: {
    type: Boolean,
    default: false
  },
  scheduledTasksCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  // Asset type matching for auto-generation
  assetType: {
    type: String
  },
  manufacturer: {
    type: String
  },
  model: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
procedureSchema.index({ assetId: 1 });
procedureSchema.index({ organizationId: 1 });
procedureSchema.index({ manufacturer: 1, model: 1 });
procedureSchema.index({ type: 1 });

module.exports = mongoose.model('Procedure', procedureSchema);
