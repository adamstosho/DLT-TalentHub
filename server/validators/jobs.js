const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorDetails,
      details: `Found ${errorDetails.length} validation error(s)`
    });
  }
  next();
};

// Create job validation
const validateCreateJob = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Job description must be between 20 and 5000 characters'),
  
  body('company.name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .withMessage('Job type must be full-time, part-time, contract, freelance, or internship'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Job category is required'),
  
  body('location.type')
    .isIn(['remote', 'hybrid', 'onsite'])
    .withMessage('Location type must be remote, hybrid, or onsite'),
  
  body('location.city')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0 && value.length < 2) {
        throw new Error('City must be at least 2 characters if provided');
      }
      if (value && value.length > 100) {
        throw new Error('City cannot exceed 100 characters');
      }
      return true;
    }),
  
  body('location.country')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0 && value.length < 2) {
        throw new Error('Country must be at least 2 characters if provided');
      }
      if (value && value.length > 100) {
        throw new Error('Country cannot exceed 100 characters');
      }
      return true;
    }),
  
  body('location.address')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0 && value.length < 5) {
        throw new Error('Address must be at least 5 characters if provided');
      }
      if (value && value.length > 200) {
        throw new Error('Address cannot exceed 200 characters');
      }
      return true;
    }),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  
  body('salary.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'NGN', 'ZAR'])
    .withMessage('Currency must be USD, EUR, GBP, NGN, or ZAR'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('isUrgent must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  handleValidationErrors
];

// Update job validation
const validateUpdateJob = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Job description must be between 20 and 5000 characters'),
  
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .withMessage('Job type must be full-time, part-time, contract, freelance, or internship'),
  
  handleValidationErrors
];

// Job application validation
const validateJobApplication = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Cover letter must be between 10 and 2000 characters'),
  
  handleValidationErrors
];

// Search jobs validation
const validateSearchJobs = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  
  query('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .withMessage('Invalid job type'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateJob,
  validateUpdateJob,
  validateJobApplication,
  validateSearchJobs
}; 