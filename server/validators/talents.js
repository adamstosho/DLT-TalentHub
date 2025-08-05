const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Update talent profile validation
const validateUpdateTalentProfile = [
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill name must be between 2 and 50 characters'),
  
  body('skills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),
  
  body('skills.*.yearsOfExperience')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  
  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),
  
  body('experience.*.title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  
  body('experience.*.company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('experience.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('experience.*.endDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values for current positions
      }
      if (!Date.parse(value)) {
        throw new Error('End date must be a valid date');
      }
      return true;
    })
    .withMessage('End date must be a valid date'),
  
  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),
  
  body('education.*.degree')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Degree must be between 2 and 100 characters'),
  
  body('education.*.institution')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institution must be between 2 and 100 characters'),
  
  body('education.*.fieldOfStudy')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Field of study must be between 2 and 100 characters'),
  
  body('education.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('education.*.endDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values for current education
      }
      if (!Date.parse(value)) {
        throw new Error('End date must be a valid date');
      }
      return true;
    })
    .withMessage('End date must be a valid date'),
  
  body('availability')
    .optional()
    .isObject()
    .withMessage('Availability must be an object'),
  
  body('availability.status')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Availability status must be available, busy, or unavailable'),
  
  body('salary')
    .optional()
    .isObject()
    .withMessage('Salary must be an object'),
  
    body('salary.minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),

  body('salary.maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),

  body('salary.period')
    .optional()
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Salary period must be hourly, daily, weekly, monthly, or yearly'),
  
  handleValidationErrors
];

// Search talents validation
const validateSearchTalents = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  
  query('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters'),
  
  query('experience')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Experience level must be entry, mid, senior, or lead'),
  
  query('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Availability must be available, busy, or unavailable'),
  
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

// Get talent by skill validation
const validateGetTalentBySkill = [
  param('skill')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill must be between 2 and 50 characters'),
  
  query('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),
  
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
  validateUpdateTalentProfile,
  validateSearchTalents,
  validateGetTalentBySkill
}; 