const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  attachments: [{
    name: String,
    url: String,
    public_id: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ application: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Compound indexes
messageSchema.index({ application: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Virtual for message age
messageSchema.virtual('ageInMinutes').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  return diffMinutes;
});

// Virtual for message age in hours
messageSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  return diffHours;
});

// Virtual for message age in days
messageSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted age
messageSchema.virtual('formattedAge').get(function() {
  const minutes = this.ageInMinutes;
  const hours = this.ageInHours;
  const days = this.ageInDays;

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to find messages by application
messageSchema.statics.findByApplication = function(applicationId, limit = 50) {
  return this.find({ application: applicationId })
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find unread messages for user
messageSchema.statics.findUnread = function(userId) {
  return this.find({ recipient: userId, isRead: false })
    .populate('sender', 'firstName lastName email avatar')
    .populate('application', 'job')
    .sort({ createdAt: -1 });
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(userId, applicationId = null) {
  const query = { recipient: userId, isRead: false };
  if (applicationId) query.application = applicationId;
  
  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

module.exports = mongoose.model('Message', messageSchema); 