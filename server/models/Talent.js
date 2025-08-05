const mongoose = require('mongoose');

const talentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50
    }
  }],
  experience: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false
    },
    grade: String
  }],
  portfolio: {
    github: String,
    linkedin: String,
    website: String,
    behance: String,
    dribbble: String,
    otherLinks: [{
      title: String,
      url: String
    }]
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  languages: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
      default: 'conversational'
    }
  }],
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    noticePeriod: {
      type: Number,
      min: 0,
      max: 90,
      default: 0
    },
    preferredWorkType: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    remotePreference: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote'
    }
  },
  salary: {
    currency: {
      type: String,
      default: 'USD'
    },
    minAmount: {
      type: Number,
      min: 0
    },
    maxAmount: {
      type: Number,
      min: 0
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    }
  },
  cv: {
    url: String,
    public_id: String,
    filename: String,
    uploadedAt: Date
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  profileCompletionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  lastProfileUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total experience years
talentSchema.virtual('totalExperienceYears').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalYears = 0;
  const now = new Date();
  
  this.experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent ? now : new Date(exp.endDate);
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += Math.max(0, years);
  });
  
  return Math.round(totalYears * 10) / 10; // Round to 1 decimal place
});

// Virtual for primary skills
talentSchema.virtual('primarySkills').get(function() {
  if (!this.skills) return [];
  return this.skills
    .filter(skill => skill.level === 'advanced' || skill.level === 'expert')
    .slice(0, 5); // Return top 5 primary skills
});

// Indexes for better query performance
talentSchema.index({ user: 1 });
talentSchema.index({ 'skills.name': 1 });
talentSchema.index({ 'availability.status': 1 });
talentSchema.index({ isPublic: 1 });
talentSchema.index({ isProfileComplete: 1 });

// Pre-save middleware to calculate profile completion
talentSchema.pre('save', function(next) {
  let completion = 0;
  let totalFields = 0;
  
  // Basic info (20%)
  totalFields += 4;
  if (this.skills && this.skills.length > 0) completion += 1;
  if (this.experience && this.experience.length > 0) completion += 1;
  if (this.education && this.education.length > 0) completion += 1;
  if (this.bio) completion += 1;
  
  // Portfolio (15%)
  totalFields += 3;
  if (this.portfolio && (this.portfolio.github || this.portfolio.linkedin)) completion += 1;
  if (this.portfolio && this.portfolio.website) completion += 1;
  if (this.cv && this.cv.url) completion += 1;
  
  // Additional info (15%)
  totalFields += 3;
  if (this.certifications && this.certifications.length > 0) completion += 1;
  if (this.languages && this.languages.length > 0) completion += 1;
  if (this.availability && this.availability.preferredWorkType && this.availability.preferredWorkType.length > 0) completion += 1;
  
  this.profileCompletionPercentage = Math.round((completion / totalFields) * 100);
  this.isProfileComplete = this.profileCompletionPercentage >= 70;
  this.lastProfileUpdate = new Date();
  
  next();
});

// Static method to find talents by skill
talentSchema.statics.findBySkill = function(skillName) {
  return this.find({
    'skills.name': { $regex: skillName, $options: 'i' },
    isPublic: true,
    isProfileComplete: true
  }).populate('user', 'firstName lastName email avatar bio location');
};

// Static method to find available talents
talentSchema.statics.findAvailable = function() {
  return this.find({
    'availability.status': 'available',
    isPublic: true,
    isProfileComplete: true
  }).populate('user', 'firstName lastName email avatar bio location');
};

// Instance method to increment views
talentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Talent', talentSchema); 