const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Talent',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    url: String,
    public_id: String,
    filename: String,
    uploadedAt: Date
  },
  portfolio: {
    url: String,
    public_id: String,
    filename: String,
    uploadedAt: Date
  },
  additionalFiles: [{
    name: String,
    url: String,
    public_id: String,
    uploadedAt: Date
  }],
  expectedSalary: {
    amount: {
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
    }
  },
  availability: {
    startDate: Date,
    noticePeriod: {
      type: Number,
      min: 0,
      max: 90,
      default: 0
    }
  },
  interview: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    time: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite']
    },
    notes: String,
    interviewer: String,
    meetingLink: String
  },
  feedback: {
    recruiter: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      date: Date
    },
    applicant: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      date: Date
    }
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,
  withdrawnReason: String,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for application age
applicationSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for expected salary display
applicationSchema.virtual('expectedSalaryDisplay').get(function() {
  if (!this.expectedSalary.amount) return 'Not specified';
  
  const currency = this.expectedSalary.currency || 'USD';
  const period = this.expectedSalary.period || 'monthly';
  
  return `${currency} ${this.expectedSalary.amount.toLocaleString()} / ${period}`;
});

// Indexes for better query performance
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ talent: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ 'interview.scheduled': 1 });
applicationSchema.index({ isWithdrawn: 1 });
applicationSchema.index({ isArchived: 1 });

// Compound indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });

// Pre-save middleware to update timeline
applicationSchema.pre('save', function(next) {
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
      updatedBy: this.updatedBy || this.applicant
    });
  }
  
  // Set withdrawnAt if status is withdrawn
  if (this.isModified('status') && this.status === 'withdrawn') {
    this.isWithdrawn = true;
    this.withdrawnAt = new Date();
  }
  
  next();
});

// Static method to find applications by job
applicationSchema.statics.findByJob = function(jobId) {
  return this.find({ job: jobId, isArchived: false })
    .populate('applicant', 'firstName lastName email avatar')
    .populate('talent', 'skills experience')
    .sort({ createdAt: -1 });
};

// Static method to find applications by applicant
applicationSchema.statics.findByApplicant = function(applicantId) {
  return this.find({ applicant: applicantId, isArchived: false })
    .populate('job', 'title company status')
    .sort({ createdAt: -1 });
};

// Static method to find applications by status
applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status, isArchived: false })
    .populate('job', 'title company')
    .populate('applicant', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to find shortlisted applications
applicationSchema.statics.findShortlisted = function() {
  return this.find({ 
    status: { $in: ['shortlisted', 'interviewed', 'offered'] },
    isArchived: false 
  })
    .populate('job', 'title company')
    .populate('applicant', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Instance method to update status
applicationSchema.methods.updateStatus = function(newStatus, notes = '', updatedBy = null) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  
  if (notes) {
    this.timeline.push({
      status: newStatus,
      date: new Date(),
      notes,
      updatedBy
    });
  }
  
  return this.save();
};

// Instance method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interview = {
    ...this.interview,
    ...interviewData,
    scheduled: true
  };
  
  this.status = 'interviewed';
  
  this.timeline.push({
    status: 'interviewed',
    date: new Date(),
    notes: `Interview scheduled for ${interviewData.date}`,
    updatedBy: interviewData.updatedBy
  });
  
  return this.save();
};

// Instance method to withdraw application
applicationSchema.methods.withdraw = function(reason = '') {
  this.status = 'withdrawn';
  this.isWithdrawn = true;
  this.withdrawnAt = new Date();
  this.withdrawnReason = reason;
  
  this.timeline.push({
    status: 'withdrawn',
    date: new Date(),
    notes: reason || 'Application withdrawn by applicant',
    updatedBy: this.applicant
  });
  
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema); 