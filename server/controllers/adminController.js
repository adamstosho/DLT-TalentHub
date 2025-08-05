const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Talent = require('../models/Talent');
const Notification = require('../models/Notification');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = asyncHandler(async (req, res, next) => {
  // Get recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-password -refreshTokens');

  // Get recent jobs
  const recentJobs = await Job.find()
    .populate('recruiter', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get recent applications
  const recentApplications = await Application.find()
    .populate('job', 'title')
    .populate('applicant', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get statistics
  const totalUsers = await User.countDocuments();
  const totalTalents = await User.countDocuments({ role: 'talent' });
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const activeJobs = await Job.countDocuments({ status: 'active' });

  res.status(200).json({
    status: 'success',
    data: {
      recentUsers,
      recentJobs,
      recentApplications,
      stats: {
        totalUsers,
        totalTalents,
        totalRecruiters,
        totalJobs,
        totalApplications,
        activeJobs
      }
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res, next) => {
  const { role, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status !== undefined) query.isActive = status === 'active';

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User status updated successfully',
    data: {
      user
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Delete related data
  await Talent.deleteMany({ user: userId });
  await Job.deleteMany({ recruiter: userId });
  await Application.deleteMany({ applicant: userId });
  await Notification.deleteMany({ 
    $or: [{ recipient: userId }, { sender: userId }] 
  });

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobs = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .populate('recruiter', 'firstName lastName email')
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

// @desc    Update job status
// @route   PUT /api/admin/jobs/:jobId/status
// @access  Private (Admin)
const updateJobStatus = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    jobId,
    { status },
    { new: true, runValidators: true }
  ).populate('recruiter', 'firstName lastName email');

  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Job status updated successfully',
    data: {
      job
    }
  });
});

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:jobId
// @access  Private (Admin)
const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Delete related applications
  await Application.deleteMany({ job: jobId });

  await Job.findByIdAndDelete(jobId);

  res.status(200).json({
    status: 'success',
    message: 'Job deleted successfully'
  });
});

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res, next) => {
  const { range = 'all' } = req.query;
  
  // Calculate date range
  let dateFilter = {};
  if (range !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    dateFilter = { createdAt: { $gte: startDate } };
  }

  // User statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const talents = await User.countDocuments({ role: 'talent' });
  const recruiters = await User.countDocuments({ role: 'recruiter' });
  const admins = await User.countDocuments({ role: 'admin' });
  const recentSignups = await User.countDocuments(dateFilter);

  // Job statistics
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: 'active' });
  const draftJobs = await Job.countDocuments({ status: 'draft' });
  const closedJobs = await Job.countDocuments({ status: 'closed' });
  const pendingJobs = await Job.countDocuments({ status: 'draft' });

  // Application statistics
  const totalApplications = await Application.countDocuments();
  const pendingApplications = await Application.countDocuments({ status: 'pending' });
  const shortlistedApplications = await Application.countDocuments({ 
    status: { $in: ['shortlisted', 'interviewed', 'offered'] } 
  });
  const acceptedApplications = await Application.countDocuments({ status: 'accepted' });

  // Talent profile statistics
  const totalTalentProfiles = await Talent.countDocuments();
  const completeProfiles = await Talent.countDocuments({ isProfileComplete: true });
  const publicProfiles = await Talent.countDocuments({ isPublic: true });

  // Calculate conversion rate (applications per job)
  const conversionRate = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies: totalJobs, // Using jobs as proxy for companies
      activeUsers,
      pendingJobs,
      recentSignups,
      conversionRate,
      users: {
        total: totalUsers,
        active: activeUsers,
        talents,
        recruiters,
        admins
      },
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
      talents: {
        total: totalTalentProfiles,
        complete: completeProfiles,
        public: publicProfiles
      }
    }
  });
});

// @desc    Get system metrics
// @route   GET /api/admin/metrics
// @access  Private (Admin)
const getSystemMetrics = asyncHandler(async (req, res, next) => {
  // Get current date and date 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // User growth
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Job growth
  const newJobsThisMonth = await Job.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Application growth
  const newApplicationsThisMonth = await Application.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Top skills
  const topSkills = await Talent.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Top job categories
  const topCategories = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      growth: {
        newUsersThisMonth,
        newJobsThisMonth,
        newApplicationsThisMonth
      },
      topSkills,
      topCategories
    }
  });
});

// @desc    Get system notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
const getNotifications = asyncHandler(async (req, res, next) => {
  const { type, page = 1, limit = 10 } = req.query;

  const query = {};
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .populate('recipient', 'firstName lastName email')
    .populate('sender', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get admin activity feed
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getAdminActivity = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  // Get recent user registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) / 2)
    .select('firstName lastName email role createdAt');

  // Get recent job postings
  const recentJobs = await Job.find()
    .populate('recruiter', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) / 2)
    .select('title company.name recruiter createdAt');

  // Get recent applications
  const recentApplications = await Application.find()
    .populate('job', 'title company.name')
    .populate('applicant', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) / 2)
    .select('job applicant status createdAt');

  // Combine and sort all activities by date
  const activities = [
    ...recentUsers.map(user => ({
      type: 'user_registration',
      title: 'New User Registration',
      description: `${user.firstName} ${user.lastName} (${user.role}) joined the platform`,
      user: user,
      createdAt: user.createdAt
    })),
    ...recentJobs.map(job => ({
      type: 'job_posted',
      title: 'New Job Posted',
      description: `${job.title} at ${job.company.name}`,
      job: job,
      recruiter: job.recruiter,
      createdAt: job.createdAt
    })),
    ...recentApplications.map(app => ({
      type: 'application_submitted',
      title: 'New Application',
      description: `${app.applicant.firstName} ${app.applicant.lastName} applied to ${app.job.title}`,
      application: app,
      createdAt: app.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
   .slice(0, parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      activities,
      total: activities.length
    }
  });
});

module.exports = {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAdminStats,
  getSystemMetrics,
  getNotifications,
  getAdminActivity
}; 