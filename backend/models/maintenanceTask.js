// backend/models/maintenanceTask.js
const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
  // Link to user and asset
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assetId: {
    type: Number,
    required: true
  },

  // Task details
  taskType: {
    type: String,
    enum: ['preventive', 'predictive', 'condition-based', 'corrective'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  hoursInterval: {
    type: Number,
    default: 0
  },

  // Scheduling
  lastCompleted: {
    type: String, // Store as date string for consistency with frontend
    default: null
  },
  nextDue: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: String,
    required: true
  },

  // Assignment
  responsible: {
    type: String,
    required: true
  },
  responsibleEmail: {
    type: String,
    required: true
  },
  responsiblePhone: {
    type: String,
    default: ''
  },

  // Priority and status
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled'],
    default: 'scheduled'
  },

  // Completion tracking
  completedBy: {
    type: String,
    default: null
  },
  completionNotes: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
maintenanceTaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update overdue status based on nextDue date
maintenanceTaskSchema.methods.updateOverdueStatus = function() {
  if (this.status === 'scheduled' || this.status === 'in-progress') {
    const dueDate = new Date(this.nextDue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      this.status = 'overdue';
    }
  }
  return this;
};

// Static method to find overdue tasks
maintenanceTaskSchema.statics.findOverdue = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.find({
    status: { $in: ['scheduled', 'in-progress'] },
    nextDue: { $lt: today.toISOString().split('T')[0] }
  });
};

// Static method to find tasks due soon (within next 7 days)
maintenanceTaskSchema.statics.findDueSoon = function() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return this.find({
    status: { $in: ['scheduled', 'in-progress'] },
    nextDue: {
      $gte: today.toISOString().split('T')[0],
      $lte: nextWeek.toISOString().split('T')[0]
    }
  });
};

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
