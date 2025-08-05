const Message = require('../models/Message');
const Application = require('../models/Application');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get messages for an application
// @route   GET /api/applications/:applicationId/messages
// @access  Private
const getApplicationMessages = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  // Verify user has access to this application
  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // Check if user is the applicant or the job recruiter
  const job = await application.populate('job');
  if (application.applicant.toString() !== userId.toString() && 
      job.job.recruiterId.toString() !== userId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ application: applicationId })
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments({ application: applicationId });

  // Mark messages as read for the current user
  await Message.markAsRead(userId, applicationId);

  res.status(200).json({
    status: 'success',
    data: {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Send a message for an application
// @route   POST /api/applications/:applicationId/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const { content } = req.body;
  const senderId = req.user._id;

  if (!content || !content.trim()) {
    return next(new AppError('Message content is required', 400));
  }

  // Verify user has access to this application
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'firstName lastName email');

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // Check if user is the applicant or the job recruiter
  if (application.applicant._id.toString() !== senderId.toString() && 
      application.job.recruiterId.toString() !== senderId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  // Determine recipient
  const recipientId = application.applicant._id.toString() === senderId.toString() 
    ? application.job.recruiterId 
    : application.applicant._id;

  const message = await Message.create({
    application: applicationId,
    sender: senderId,
    recipient: recipientId,
    content: content.trim()
  });

  await message.populate('sender', 'firstName lastName email avatar');
  await message.populate('recipient', 'firstName lastName email avatar');

  res.status(201).json({
    status: 'success',
    data: {
      message
    }
  });
});

// @desc    Get unread message count for user
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadMessageCount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const count = await Message.countDocuments({
    recipient: userId,
    isRead: false
  });

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount: count
    }
  });
});

// @desc    Mark messages as read for an application
// @route   PUT /api/applications/:applicationId/messages/read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res, next) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  // Verify user has access to this application
  const application = await Application.findById(applicationId);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const job = await application.populate('job');
  if (application.applicant.toString() !== userId.toString() && 
      job.job.recruiterId.toString() !== userId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  await Message.markAsRead(userId, applicationId);

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});

// @desc    Get all unread messages for user
// @route   GET /api/messages/unread
// @access  Private
const getUnreadMessages = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const messages = await Message.find({ recipient: userId, isRead: false })
    .populate('sender', 'firstName lastName email avatar')
    .populate('application', 'job')
    .populate('application.job', 'title company')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments({ recipient: userId, isRead: false });

  res.status(200).json({
    status: 'success',
    data: {
      messages,
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
  getApplicationMessages,
  sendMessage,
  getUnreadMessageCount,
  markMessagesAsRead,
  getUnreadMessages
}; 