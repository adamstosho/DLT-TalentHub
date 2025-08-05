const express = require('express');
const router = express.Router();

const { verifyToken, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Import job validators
const {
  validateCreateJob,
  validateUpdateJob,
  validateJobApplication,
  validateSearchJobs
} = require('../validators/jobs');

// Placeholder for job controller functions
const {
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
} = require('../controllers/jobController');

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company
 *               - type
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: object
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, freelance, internship]
 *               category:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *               salary:
 *                 type: object
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Not authenticated or not a recruiter
 */
router.post('/', verifyToken, authorize('recruiter', 'admin'), validateCreateJob, createJob);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, draft, paused, closed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, freelance, internship]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', optionalAuth, getJobs);

// Debug endpoint to check all jobs
router.get('/debug/all', async (req, res) => {
  try {
    const allJobs = await Job.find({}).select('_id title status visibility createdAt');
    console.log('Debug - All jobs in DB:', allJobs);
    res.json({
      status: 'success',
      data: {
        jobs: allJobs,
        count: allJobs.length
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/search:
 *   get:
 *     summary: Search jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, freelance, internship]
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', optionalAuth, validateSearchJobs, searchJobs);

/**
 * @swagger
 * /api/jobs/category/{category}:
 *   get:
 *     summary: Get jobs by category
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs in the specified category
 */
router.get('/category/:category', getJobsByCategory);

/**
 * @swagger
 * /api/jobs/urgent:
 *   get:
 *     summary: Get urgent jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of urgent jobs
 */
router.get('/urgent', getUrgentJobs);

/**
 * @swagger
 * /api/jobs/featured:
 *   get:
 *     summary: Get featured jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of featured jobs
 */
router.get('/featured', getFeaturedJobs);

/**
 * @swagger
 * /api/jobs/saved:
 *   get:
 *     summary: Get saved jobs for the authenticated talent
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of saved jobs
 *       401:
 *         description: Not authenticated
 */
router.get('/saved', verifyToken, authorize('talent'), getSavedJobs);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:jobId', incrementJobViews);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       403:
 *         description: Not authorized to update this job
 */
router.put('/:jobId', verifyToken, authorize('recruiter', 'admin'), validateUpdateJob, updateJob);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       403:
 *         description: Not authorized to delete this job
 */
router.delete('/:jobId', verifyToken, authorize('recruiter', 'admin'), deleteJob);

/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *               expectedSalary:
 *                 type: object
 *               availability:
 *                 type: object
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Already applied or job not available
 */
router.post('/:jobId/apply', verifyToken, authorize('talent'), validateJobApplication, applyToJob);

/**
 * @swagger
 * /api/jobs/{jobId}/applications:
 *   get:
 *     summary: Get applications for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, shortlisted, interviewed, offered, accepted, rejected]
 *     responses:
 *       200:
 *         description: List of applications
 *       403:
 *         description: Not authorized to view applications
 */
router.get('/:jobId/applications', verifyToken, authorize('recruiter', 'admin'), getJobApplications);

/**
 * @swagger
 * /api/jobs/applications/{applicationId}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, interviewed, offered, accepted, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       403:
 *         description: Not authorized to update this application
 */
router.put('/applications/:applicationId/status', verifyToken, authorize('recruiter', 'admin'), updateApplicationStatus);



/**
 * @swagger
 * /api/jobs/{jobId}/save:
 *   post:
 *     summary: Save a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Job saved successfully
 *       400:
 *         description: Job already saved
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Job not found
 */
router.post('/:jobId/save', verifyToken, authorize('talent'), saveJob);

/**
 * @swagger
 * /api/jobs/{jobId}/save:
 *   delete:
 *     summary: Unsave a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job removed from saved jobs
 *       400:
 *         description: Job not saved
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Job not found
 */
router.delete('/:jobId/save', verifyToken, authorize('talent'), unsaveJob);

module.exports = router; 