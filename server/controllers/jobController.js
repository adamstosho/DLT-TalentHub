const Job = require('../models/Job');
const Application = require('../models/Application');
const Talent = require('../models/Talent');
const Notification = require('../models/Notification');
const SavedJob = require('../models/SavedJob'); // Added SavedJob model
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../utils/email');
const logger = require('../utils/logger');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter, Admin)
const createJob = asyncHandler(async (req, res, next) => {
  console.log('Job creation request body:', JSON.stringify(req.body, null, 2));
  
  const jobData = {
    ...req.body,
    recruiter: req.user._id
  };

  console.log('Job data to be created:', JSON.stringify(jobData, null, 2));

  const job = await Job.create(jobData);

  console.log('Job created successfully:', JSON.stringify(job, null, 2));

  res.status(201).json({
    status: 'success',
    message: 'Job created successfully',
    data: {
      job
    }
  });
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, type } = req.query;

  const query = { visibility: 'public' };

  if (status) query.status = status;
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .populate('recruiter', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Job.countDocuments(query);

  console.log('GetJobs - Query:', query);
  console.log('GetJobs - Found jobs:', jobs.length);
  console.log('GetJobs - Total jobs in DB:', await Job.countDocuments({}));

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

// @desc    Get job by ID
// @route   GET /api/jobs/:jobId
// @access  Public
const getJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  console.log('Fetching job with ID:', jobId);

  const job = await Job.findById(jobId)
    .populate('recruiter', 'firstName lastName email avatar');

  console.log('Job found:', JSON.stringify(job, null, 2));

  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  if (job.visibility !== 'public' && (!req.user || req.user.role !== 'admin')) {
    return next(new AppError('Job not accessible', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:jobId
// @access  Private (Recruiter, Admin)
const updateJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Check if user can update this job
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this job', 403));
  }

  const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, {
    new: true,
    runValidators: true
  }).populate('recruiter', 'firstName lastName email avatar');

  res.status(200).json({
    status: 'success',
    message: 'Job updated successfully',
    data: {
      job: updatedJob
    }
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:jobId
// @access  Private (Recruiter, Admin)
const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Check if user can delete this job
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this job', 403));
  }

  await Job.findByIdAndDelete(jobId);

  res.status(200).json({
    status: 'success',
    message: 'Job deleted successfully'
  });
});

// @desc    Apply to a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Talent)
const applyToJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { coverLetter, expectedSalary, availability } = req.body;

  // Check if job exists and is active
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  if (job.status !== 'active') {
    return next(new AppError('Job is not accepting applications', 400));
  }

  // Check if user has already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id
  });

  if (existingApplication) {
    return next(new AppError('You have already applied to this job', 400));
  }

  // Get talent profile
  const talent = await Talent.findOne({ user: req.user._id });
  if (!talent) {
    return next(new AppError('Talent profile not found', 404));
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    talent: talent._id,
    coverLetter,
    expectedSalary,
    availability
  });

  // Increment job applications count
  await job.incrementApplications('total');

  // Create notification for recruiter
  await Notification.create({
    recipient: job.recruiter,
    sender: req.user._id,
    type: 'job_application',
    title: 'New Job Application',
    message: `${req.user.firstName} ${req.user.lastName} has applied to your job: ${job.title}`,
    data: {
      job: jobId,
      application: application._id
    }
  });

  // Send email notification to recruiter
  try {
    const recruiter = await User.findById(job.recruiter);
    if (recruiter) {
      const applicationEmail = emailTemplates.jobApplication(job.title, job.company.name);
      await sendEmail(recruiter.email, applicationEmail.subject, applicationEmail.html);
    }
  } catch (error) {
    logger.error('Failed to send application email:', error);
  }

  res.status(201).json({
    status: 'success',
    message: 'Application submitted successfully',
    data: {
      application
    }
  });
});

// @desc    Get applications for a job
// @route   GET /api/jobs/:jobId/applications
// @access  Private (Recruiter, Admin)
const getJobApplications = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Check if user can view applications
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view these applications', 403));
  }

  const query = { job: jobId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const applications = await Application.find(query)
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

// @desc    Update application status
// @route   PUT /api/jobs/applications/:applicationId/status
// @access  Private (Recruiter, Admin)
const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;

  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'firstName lastName email');

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // Check if user can update this application
  if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this application', 403));
  }

  // Update application status
  await application.updateStatus(status, notes, req.user._id);

  // Create notification for applicant
  await Notification.create({
    recipient: application.applicant._id,
    sender: req.user._id,
    type: 'application_status_change',
    title: 'Application Status Updated',
    message: `Your application for ${application.job.title} has been ${status}`,
    data: {
      job: application.job._id,
      application: application._id
    }
  });

  // Send email for important status changes
  if (status === 'shortlisted' || status === 'interviewed' || status === 'offered') {
    try {
      const statusEmail = emailTemplates.shortlisted(application.job.title, application.job.company.name);
      await sendEmail(application.applicant.email, statusEmail.subject, statusEmail.html);
    } catch (error) {
      logger.error('Failed to send status email:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Application status updated successfully',
    data: {
      application
    }
  });
});

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
const searchJobs = asyncHandler(async (req, res, next) => {
  const { q, category, location, type, skills, page = 1, limit = 10 } = req.query;

  const query = { status: 'active', visibility: 'public' };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Filter by category
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  // Filter by location
  if (location) {
    query['location.city'] = { $regex: location, $options: 'i' };
  }

  // Filter by type
  if (type) {
    query.type = type;
  }

  // Filter by skills
  if (skills) {
    const skillArray = skills.split(',').map(s => s.trim());
    query.skills = { $in: skillArray.map(s => new RegExp(s, 'i')) };
  }

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .populate('recruiter', 'firstName lastName email avatar')
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

// @desc    Get jobs by category
// @route   GET /api/jobs/category/:category
// @access  Public
const getJobsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  const jobs = await Job.findByCategory(category);

  res.status(200).json({
    status: 'success',
    data: {
      jobs
    }
  });
});

// @desc    Get urgent jobs
// @route   GET /api/jobs/urgent
// @access  Public
const getUrgentJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.findUrgent();

  res.status(200).json({
    status: 'success',
    data: {
      jobs
    }
  });
});

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
const getFeaturedJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.findFeatured();

  res.status(200).json({
    status: 'success',
    data: {
      jobs
    }
  });
});

// @desc    Increment job views
// @route   GET /api/jobs/:jobId
// @access  Public
const incrementJobViews = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  console.log('IncrementJobViews - Fetching job with ID:', jobId);

  const job = await Job.findById(jobId)
    .populate('recruiter', 'firstName lastName email avatar');

  console.log('IncrementJobViews - Job found:', JSON.stringify(job, null, 2));

  if (!job) {
    console.log('IncrementJobViews - Job not found');
    return next(new AppError('Job not found', 404));
  }

  if (job.visibility !== 'public' && (!req.user || req.user.role !== 'admin')) {
    console.log('IncrementJobViews - Job not accessible');
    return next(new AppError('Job not accessible', 403));
  }

  // Increment views
  await job.incrementViews();

  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});

// @desc    Save a job
// @route   POST /api/jobs/:jobId/save
// @access  Private (Talent)
const saveJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const talentId = req.user._id;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Check if already saved
  const existingSave = await SavedJob.findOne({ job: jobId, talent: talentId });
  if (existingSave) {
    return next(new AppError('Job already saved', 400));
  }

  // Save the job
  await SavedJob.create({ job: jobId, talent: talentId });

  res.status(201).json({
    status: 'success',
    message: 'Job saved successfully'
  });
});

// @desc    Unsave a job
// @route   DELETE /api/jobs/:jobId/save
// @access  Private (Talent)
const unsaveJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const talentId = req.user._id;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // Remove saved job
  const deletedSave = await SavedJob.findOneAndDelete({ job: jobId, talent: talentId });
  if (!deletedSave) {
    return next(new AppError('Job not saved', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Job removed from saved jobs'
  });
});

// @desc    Get saved jobs
// @route   GET /api/jobs/saved
// @access  Private (Talent)
const getSavedJobs = asyncHandler(async (req, res, next) => {
  const talentId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const savedJobs = await SavedJob.find({ talent: talentId })
    .populate({
      path: 'job',
      populate: {
        path: 'recruiter',
        select: 'firstName lastName email avatar'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SavedJob.countDocuments({ talent: talentId });

  res.status(200).json({
    status: 'success',
    data: {
      jobs: savedJobs.map(saved => saved.job),
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
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  searchJobs,
  getJobsByCategory,
  getUrgentJobs,
  getFeaturedJobs,
  incrementJobViews,
  saveJob,
  unsaveJob,
  getSavedJobs
}; 