const Job = require('../models/Job');
const Application = require('../models/Application');
const Talent = require('../models/Talent');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get recruiter dashboard
// @route   GET /api/recruiters/dashboard
// @access  Private (Recruiter)
const getRecruiterDashboard = asyncHandler(async (req, res, next) => {
  const recruiterId = req.user._id;

  // Get recruiter's jobs
  const jobs = await Job.find({ recruiter: recruiterId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get recent applications
  const applications = await Application.find({
    job: { $in: jobs.map(job => job._id) }
  })
    .populate('job', 'title company')
    .populate('applicant', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get statistics
  const totalJobs = await Job.countDocuments({ recruiter: recruiterId });
  const activeJobs = await Job.countDocuments({ 
    recruiter: recruiterId, 
    status: 'active' 
  });
  const totalApplications = await Application.countDocuments({
    job: { $in: jobs.map(job => job._id) }
  });
  const pendingApplications = await Application.countDocuments({
    job: { $in: jobs.map(job => job._id) },
    status: 'pending'
  });

  res.status(200).json({
    status: 'success',
    data: {
      jobs,
      applications,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications
      }
    }
  });
});

// @desc    Get recruiter's jobs
// @route   GET /api/recruiters/jobs
// @access  Private (Recruiter)
const getMyJobs = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const recruiterId = req.user._id;

  const query = { recruiter: recruiterId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Job.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get applications for recruiter's jobs
// @route   GET /api/recruiters/applications
// @access  Private (Recruiter)
const getMyApplications = asyncHandler(async (req, res, next) => {
  const { status, jobId, page = 1, limit = 10 } = req.query;
  const recruiterId = req.user._id;

  // Get recruiter's job IDs
  const jobIds = await Job.find({ recruiter: recruiterId }).select('_id');
  const jobIdArray = jobIds.map(job => job._id);

  const query = { job: { $in: jobIdArray } };
  if (status) query.status = status;
  if (jobId) query.job = jobId;

  const skip = (page - 1) * limit;

  const applications = await Application.find(query)
    .populate('job', 'title company status')
    .populate('applicant', 'firstName lastName email avatar')
    .populate('talent', 'skills experience')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get recruiter statistics
// @route   GET /api/recruiters/stats
// @access  Private (Recruiter)
const getRecruiterStats = asyncHandler(async (req, res, next) => {
  const recruiterId = req.user._id;

  // Get recruiter's job IDs
  const jobIds = await Job.find({ recruiter: recruiterId }).select('_id');
  const jobIdArray = jobIds.map(job => job._id);

  // Job statistics
  const totalJobs = await Job.countDocuments({ recruiter: recruiterId });
  const activeJobs = await Job.countDocuments({ 
    recruiter: recruiterId, 
    status: 'active' 
  });
  const draftJobs = await Job.countDocuments({ 
    recruiter: recruiterId, 
    status: 'draft' 
  });
  const closedJobs = await Job.countDocuments({ 
    recruiter: recruiterId, 
    status: 'closed' 
  });

  // Application statistics
  const totalApplications = await Application.countDocuments({
    job: { $in: jobIdArray }
  });
  const pendingApplications = await Application.countDocuments({
    job: { $in: jobIdArray },
    status: 'pending'
  });
  const shortlistedApplications = await Application.countDocuments({
    job: { $in: jobIdArray },
    status: { $in: ['shortlisted', 'interviewed', 'offered'] }
  });
  const acceptedApplications = await Application.countDocuments({
    job: { $in: jobIdArray },
    status: 'accepted'
  });

  // Views statistics
  const totalViews = await Job.aggregate([
    { $match: { recruiter: recruiterId } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      jobs: {
        total: totalJobs,
        active: activeJobs,
        draft: draftJobs,
        closed: closedJobs
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        shortlisted: shortlistedApplications,
        accepted: acceptedApplications
      },
      views: {
        total: totalViews[0]?.totalViews || 0
      }
    }
  });
});

// @desc    Search talents for a specific job
// @route   GET /api/recruiters/search-talents
// @access  Private (Recruiter)
const searchTalentsForJob = asyncHandler(async (req, res, next) => {
  const { jobId, skills, experience, location, page = 1, limit = 10 } = req.query;

  // Get job details if jobId is provided
  let job = null;
  if (jobId) {
    job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this job', 403));
    }
  }

  const query = { isPublic: true, isProfileComplete: true };

  // Filter by skills (from job or query parameter)
  if (job && job.skills && job.skills.length > 0) {
    query['skills.name'] = { $in: job.skills.map(s => new RegExp(s, 'i')) };
  } else if (skills) {
    const skillArray = skills.split(',').map(s => s.trim());
    query['skills.name'] = { $in: skillArray.map(s => new RegExp(s, 'i')) };
  }

  // Filter by experience
  if (experience) {
    query['experience.yearsOfExperience'] = { $gte: parseInt(experience) };
  }

  // Filter by location
  if (location) {
    const users = await User.find({
      location: { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    
    query.user = { $in: users.map(u => u._id) };
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
      job,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  getRecruiterDashboard,
  getMyJobs,
  getMyApplications,
  getRecruiterStats,
  searchTalentsForJob
}; 