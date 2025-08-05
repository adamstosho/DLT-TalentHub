const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: {
      url: String,
      public_id: String
    },
    website: String,
    location: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: String
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  location: {
    type: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      required: true
    },
    city: String,
    country: String,
    address: String
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  experience: {
    min: {
      type: Number,
      min: 0,
      default: 0
    },
    max: {
      type: Number,
      min: 0
    },
    level: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
    }
  },
  education: {
    required: {
      type: Boolean,
      default: false
    },
    level: {
      type: String,
      enum: ['high-school', 'bachelor', 'master', 'phd', 'certification']
    },
    field: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'internal'],
    default: 'public'
  },
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  duration: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  applications: {
    total: {
      type: Number,
      default: 0
    },
    shortlisted: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    }
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for salary range display
jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Not specified';
  
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'monthly';
  
  if (this.salary.min && this.salary.max) {
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} / ${period}`;
  } else if (this.salary.min) {
    return `${currency} ${this.salary.min.toLocaleString()}+ / ${period}`;
  } else {
    return `${currency} Up to ${this.salary.max.toLocaleString()} / ${period}`;
  }
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function() {
  if (!this.publishedAt) return null;
  const now = new Date();
  const posted = new Date(this.publishedAt);
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for application deadline status
jobSchema.virtual('isDeadlinePassed').get(function() {
  if (!this.applicationDeadline) return false;
  return new Date() > new Date(this.applicationDeadline);
});

// Indexes for better query performance
jobSchema.index({ recruiter: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ visibility: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ 'location.type': 1 });
jobSchema.index({ 'skills': 1 });
jobSchema.index({ isUrgent: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ publishedAt: -1 });
jobSchema.index({ createdAt: -1 });

// Text index for search
jobSchema.index({
  title: 'text',
  description: 'text',
  'company.name': 'text',
  skills: 'text',
  tags: 'text'
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Set expiresAt if not set and applicationDeadline exists
  if (this.applicationDeadline && !this.expiresAt) {
    this.expiresAt = new Date(this.applicationDeadline);
  }
  
  // Auto-expire featured jobs
  if (this.featuredUntil && new Date() > new Date(this.featuredUntil)) {
    this.isFeatured = false;
  }
  
  next();
});

// Static method to find active jobs
jobSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    visibility: 'public',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('recruiter', 'firstName lastName email avatar');
};

// Static method to find jobs by category
jobSchema.statics.findByCategory = function(category) {
  return this.find({
    category: { $regex: category, $options: 'i' },
    status: 'active',
    visibility: 'public'
  }).populate('recruiter', 'firstName lastName email avatar');
};

// Static method to find jobs by skills
jobSchema.statics.findBySkills = function(skills) {
  return this.find({
    skills: { $in: skills.map(skill => new RegExp(skill, 'i')) },
    status: 'active',
    visibility: 'public'
  }).populate('recruiter', 'firstName lastName email avatar');
};

// Static method to find urgent jobs
jobSchema.statics.findUrgent = function() {
  return this.find({
    isUrgent: true,
    status: 'active',
    visibility: 'public'
  }).populate('recruiter', 'firstName lastName email avatar');
};

// Static method to find featured jobs
jobSchema.statics.findFeatured = function() {
  return this.find({
    isFeatured: true,
    status: 'active',
    visibility: 'public'
  }).populate('recruiter', 'firstName lastName email avatar');
};

// Instance method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = function(status = 'total') {
  this.applications[status] += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema); 