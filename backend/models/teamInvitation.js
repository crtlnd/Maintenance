const mongoose = require('mongoose');
const crypto = require('crypto');

const teamInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  role: {
    type: String,
    enum: ['owner', 'technician'],
    default: 'technician'
  },

  // Unique token for the invitation link
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },

  // 30-day expiration as requested
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: true
  },

  // Track when invitation was accepted
  acceptedAt: {
    type: Date,
    default: null
  },

  // User who accepted the invitation
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
teamInvitationSchema.index({ email: 1, organizationId: 1 });
teamInvitationSchema.index({ token: 1 }, { unique: true });
teamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired invitations
teamInvitationSchema.index({ organizationId: 1, status: 1 });

// Pre-save middleware to generate token and update timestamps
teamInvitationSchema.pre('save', function(next) {
  // Generate secure token if not exists
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }

  this.updatedAt = new Date();
  next();
});

// Instance methods
teamInvitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

teamInvitationSchema.methods.isPending = function() {
  return this.status === 'pending' && !this.isExpired();
};

teamInvitationSchema.methods.accept = function(userId) {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.acceptedBy = userId;
  return this.save();
};

teamInvitationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

teamInvitationSchema.methods.generateInviteUrl = function(baseUrl = 'http://localhost:3000') {
  return `${baseUrl}/join-organization?token=${this.token}`;
};

// Static methods
teamInvitationSchema.statics.findPendingByOrganization = function(organizationId) {
  return this.find({
    organizationId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

teamInvitationSchema.statics.findByToken = function(token) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

teamInvitationSchema.statics.findByEmailAndOrganization = function(email, organizationId) {
  return this.findOne({
    email: email.toLowerCase(),
    organizationId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

// Check if user already has pending invitation
teamInvitationSchema.statics.hasPendingInvitation = function(email, organizationId) {
  return this.findOne({
    email: email.toLowerCase(),
    organizationId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).then(invitation => !!invitation);
};

// Clean up expired invitations (utility method)
teamInvitationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: { $in: ['expired', 'accepted'] } }
    ]
  });
};

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);

module.exports = TeamInvitation;
