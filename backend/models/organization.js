const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  type: {
    type: String,
    enum: ['internal', 'service_provider'],
    default: 'internal'
  },

  settings: {
    allowExternalAccess: {
      type: Boolean,
      default: false
    },
    dataSharing: {
      assets: {
        type: Boolean,
        default: true
      },
      maintenance: {
        type: Boolean,
        default: true
      }
    }
  },

  // Organization metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Future: subscription/billing info could go here
  subscription: {
    plan: {
      type: String,
      default: 'professional'
    },
    // Future: billing details
  }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ name: 1 });
organizationSchema.index({ createdBy: 1 });

// Pre-save middleware to update timestamps
organizationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
organizationSchema.methods.canAddMember = function() {
  // Future: implement seat limits or other restrictions
  return true;
};

organizationSchema.methods.hasExternalAccess = function() {
  return this.settings.allowExternalAccess;
};

// Static methods
organizationSchema.statics.findByOwner = function(userId) {
  return this.find({ createdBy: userId });
};

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
