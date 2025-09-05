const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, required: true },
  role: {
    type: String,
    default: 'user'
    // Removed enum restriction to allow free-form job titles like "Maintenance Manager"
  },
  consent: { type: Boolean, default: false },

  // Organization relationship (NEW)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },

  // Organization role (NEW) - separate from job title role
  organizationRole: {
    type: String,
    enum: ['owner', 'technician'],
    default: 'technician'
  },

  // Updated subscription fields to match your actual subscription structure
  subscriptionTier: {
    type: String,
    enum: ['Basic', 'Professional', 'Annual'], // Fixed: Changed 'Enterprise' back to 'Annual'
    default: 'Basic'
  },
  userType: {
    type: String,
    enum: ['customer', 'service_provider', 'admin'],
    default: 'customer'
  },

  // Future: service provider scaffolding (NEW)
  accessType: {
    type: String,
    enum: ['member', 'external_provider'],
    default: 'member'
  },

  // Future: granular permissions placeholder (NEW)
  permissions: {
    type: Map,
    of: Boolean,
    default: new Map()
  },

  // Add subscription object that frontend expects
  subscription: {
    plan: {
      type: String,
      enum: ['Basic', 'Professional', 'Annual'], // Fixed: Changed 'Enterprise' back to 'Annual'
      default: 'Basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    }
  },

  // Admin-specific fields
  isActive: {
    type: Boolean,
    default: true
  },
  organization: {
    type: String,
    default: function() {
      return this.company;
    }
  },
  avatar: { type: String },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  assetCount: { type: Number, default: 0 },
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },

  // Enhanced notification preferences to match frontend
  notificationPreferences: {
    maintenanceDue: { type: Boolean, default: true },
    maintenanceOverdue: { type: Boolean, default: true },
    assetFailures: { type: Boolean, default: true },
    highRiskFMEA: { type: Boolean, default: true },
    taskAssignments: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    digestFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    // Keep legacy fields for compatibility
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
});

// Indexes (NEW)
userSchema.index({ organizationId: 1 });
userSchema.index({ organizationRole: 1 });

// Add method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.userType === 'admin' || this.role === 'admin';
};

// NEW: Organization-related methods
userSchema.methods.isOrganizationOwner = function() {
  return this.organizationRole === 'owner';
};

userSchema.methods.canInviteMembers = function() {
  return this.organizationRole === 'owner';
};

userSchema.methods.hasOrganization = function() {
  return this.organizationId !== null;
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Future: permission checking methods
userSchema.methods.hasPermission = function(permission) {
  // Simple implementation for now
  if (this.organizationRole === 'owner') return true;
  return this.permissions.get(permission) || false;
};

userSchema.methods.canAccessAssets = function() {
  return this.isActive && this.hasOrganization();
};

// NEW: Static methods
userSchema.statics.findByOrganization = function(organizationId) {
  return this.find({ organizationId, isActive: true });
};

userSchema.statics.findOwners = function() {
  return this.find({ organizationRole: 'owner', isActive: true });
};

// Pre-save middleware to sync subscriptionTier with subscription.plan
userSchema.pre('save', async function (next) {
  console.log('Pre-save hook triggered for user:', this.email);

  // Hash password if modified
  if (this.isModified('password')) {
    console.log('Hashing password for user:', this.email);
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Sync subscriptionTier with subscription.plan
  if (this.isModified('subscriptionTier')) {
    if (!this.subscription) {
      this.subscription = {};
    }
    this.subscription.plan = this.subscriptionTier;
  }

  // Sync subscription.plan with subscriptionTier
  if (this.subscription && this.subscription.plan && this.isModified('subscription.plan')) {
    this.subscriptionTier = this.subscription.plan;
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
