const Talent = require('../models/Talent');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

// @desc    Get current user's talent profile
// @route   GET /api/talents/profile
// @access  Private
const getTalentProfile = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email avatar bio location');

  if (!talent) {
    return next(new AppError('Talent profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      talent
    }
  });
});

// @desc    Update talent profile
// @route   PUT /api/talents/profile
// @access  Private
const updateTalentProfile = asyncHandler(async (req, res, next) => {
  const {
    skills,
    experience,
    education,
    portfolio,
    certifications,
    languages,
    availability,
    salary
  } = req.body;

  let talent = await Talent.findOne({ user: req.user._id });
  
  if (!talent) {
    return next(new AppError('Talent profile not found', 404));
  }

  // Update fields
  if (skills) talent.skills = skills;
  if (experience) talent.experience = experience;
  if (education) talent.education = education;
  if (portfolio) talent.portfolio = portfolio;
  if (certifications) talent.certifications = certifications;
  if (languages) talent.languages = languages;
  if (availability) talent.availability = availability;
  if (salary) talent.salary = salary;

  await talent.save();

  // Populate user data
  talent = await talent.populate('user', 'firstName lastName email avatar bio location');

  res.status(200).json({
    status: 'success',
    message: 'Talent profile updated successfully',
    data: {
      talent
    }
  });
});

// @desc    Upload CV
// @route   POST /api/talents/cv
// @access  Private
const uploadCV = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a CV file', 400));
  }

  const talent = await Talent.findOne({ user: req.user._id });
  if (!talent) {
    return next(new AppError('Talent profile not found', 404));
  }

  try {
    // Delete old CV if exists
    if (talent.cv && talent.cv.public_id) {
      await deleteFromCloudinary(talent.cv.public_id);
    }

    // Upload new CV
    const result = await uploadToCloudinary(req.file.path, 'cvs');
    
    talent.cv = {
      url: result.url,
      public_id: result.public_id,
      filename: req.file.originalname,
      uploadedAt: new Date()
    };

    await talent.save();

    res.status(200).json({
      status: 'success',
      message: 'CV uploaded successfully',
      data: {
        cv: talent.cv
      }
    });
  } catch (error) {
    logger.error('CV upload error:', error);
    return next(new AppError('Failed to upload CV', 500));
  }
});

// @desc    Delete CV
// @route   DELETE /api/talents/cv
// @access  Private
const deleteCV = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findOne({ user: req.user._id });
  if (!talent) {
    return next(new AppError('Talent profile not found', 404));
  }

  if (talent.cv && talent.cv.public_id) {
    try {
      await deleteFromCloudinary(talent.cv.public_id);
    } catch (error) {
      logger.error('CV delete error:', error);
    }
  }

  talent.cv = undefined;
  await talent.save();

  res.status(200).json({
    status: 'success',
    message: 'CV deleted successfully'
  });
});

// @desc    Search talents
// @route   GET /api/talents/search
// @access  Public
const searchTalents = asyncHandler(async (req, res, next) => {
  const { q, skills, location, availability, page = 1, limit = 10 } = req.query;

  const query = { isPublic: true };

  // Search by user info
  if (q) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }).select('_id');
    
    query.user = { $in: users.map(u => u._id) };
  }

  // Filter by skills
  if (skills) {
    const skillArray = skills.split(',').map(s => s.trim());
    query['skills.name'] = { $in: skillArray.map(s => new RegExp(s, 'i')) };
  }

  // Filter by location
  if (location) {
    const users = await User.find({
      location: { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    
    query.user = { $in: users.map(u => u._id) };
  }

  // Filter by availability
  if (availability) {
    query['availability.status'] = availability;
  }

  const skip = (page - 1) * limit;

  const talents = await Talent.find(query)
    .populate('user', 'firstName lastName email avatar bio location')
    .sort({ lastProfileUpdate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Talent.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      talents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get talents by skill
// @route   GET /api/talents/skills/:skillName
// @access  Public
const getTalentBySkill = asyncHandler(async (req, res, next) => {
  const { skillName } = req.params;

  const talents = await Talent.findBySkill(skillName);

  res.status(200).json({
    status: 'success',
    data: {
      talents
    }
  });
});

// @desc    Get available talents
// @route   GET /api/talents/available
// @access  Public
const getAvailableTalents = asyncHandler(async (req, res, next) => {
  const talents = await Talent.findAvailable();

  res.status(200).json({
    status: 'success',
    data: {
      talents
    }
  });
});

// @desc    Get talent's applications
// @route   GET /api/talents/applications
// @access  Private
const getTalentApplications = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findOne({ user: req.user._id });
  
  if (!talent) {
    return next(new AppError('Talent not found', 404));
  }

  const Application = require('../models/Application');
  
  const applications = await Application.find({ talent: talent._id })
    .populate('job', 'title company.name location status')
    .sort({ createdAt: -1 });

  // Transform applications for frontend
  const transformedApplications = applications.map(app => ({
    _id: app._id,
    jobTitle: app.job.title,
    company: app.job.company.name,
    status: app.status,
    appliedAt: app.createdAt,
    location: app.job.location?.city || app.job.location?.country || 'Remote'
  }));

  res.status(200).json({
    status: 'success',
    data: {
      applications: transformedApplications
    }
  });
});

// @desc    Increment profile views
// @route   GET /api/talents/:talentId
// @access  Public
const incrementProfileViews = asyncHandler(async (req, res, next) => {
  const { talentId } = req.params;

  const talent = await Talent.findById(talentId)
    .populate('user', 'firstName lastName email avatar bio location');

  if (!talent) {
    return next(new AppError('Talent not found', 404));
  }

  if (!talent.isPublic) {
    return next(new AppError('Talent profile is private', 403));
  }

  // Increment views
  await talent.incrementViews();

  res.status(200).json({
    status: 'success',
    data: {
      talent
    }
  });
});

module.exports = {
  getTalentProfile,
  updateTalentProfile,
  uploadCV,
  deleteCV,
  searchTalents,
  getTalentBySkill,
  getAvailableTalents,
  getTalentApplications,
  incrementProfileViews
}; 