const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'job_application',
      'application_status_change',
      'interview_scheduled',
      'job_shortlisted',
      'job_rejected',
      'job_offered',
      'profile_viewed',
      'new_job_match',
      'system_message',
      'welcome',
      'password_reset',
      'email_verification'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Talent'
    },
    url: String,
    actionText: String,
    actionUrl: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  readAt: Date,
  expiresAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
notificationSchema.virtual('ageInMinutes').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  return diffMinutes;
});

// Virtual for notification age in hours
notificationSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours;
});

// Virtual for notification age in days
notificationSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted age
notificationSchema.virtual('formattedAge').get(function() {
  const minutes = this.ageInMinutes;
  const hours = this.ageInHours;
  const days = this.ageInDays;
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

// TTL index to automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration (30 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Set priority based on type
  if (!this.priority) {
    switch (this.type) {
      case 'job_offered':
      case 'interview_scheduled':
        this.priority = 'high';
        break;
      case 'job_shortlisted':
      case 'new_job_match':
        this.priority = 'medium';
        break;
      case 'system_message':
      case 'welcome':
        this.priority = 'low';
        break;
      default:
        this.priority = 'medium';
    }
  }
  
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to find unread notifications for user
notificationSchema.statics.findUnread = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false
  })
    .populate('sender', 'firstName lastName avatar')
    .populate('data.job', 'title company')
    .sort({ createdAt: -1 });
};

// Static method to find all notifications for user
notificationSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ recipient: userId })
    .populate('sender', 'firstName lastName avatar')
    .populate('data.job', 'title company')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(userId, type) {
  return this.find({
    recipient: userId,
    type: type
  })
    .populate('sender', 'firstName lastName avatar')
    .populate('data.job', 'title company')
    .sort({ createdAt: -1 });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = { recipient: userId };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOld = function(days = 90) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.isEmailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema); 