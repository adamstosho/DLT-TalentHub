const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Placeholder for recruiter controller functions
const {
  getRecruiterDashboard,
  getMyJobs,
  getMyApplications,
  getRecruiterStats,
  searchTalentsForJob
} = require('../controllers/recruiterController');

/**
 * @swagger
 * /api/recruiters/dashboard:
 *   get:
 *     summary: Get recruiter dashboard data
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Not authenticated or not a recruiter
 */
router.get('/dashboard', verifyToken, authorize('recruiter'), getRecruiterDashboard);

/**
 * @swagger
 * /api/recruiters/jobs:
 *   get:
 *     summary: Get jobs posted by the recruiter
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, draft, paused, closed]
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
 *         description: List of recruiter's jobs
 */
router.get('/jobs', verifyToken, authorize('recruiter'), getMyJobs);

/**
 * @swagger
 * /api/recruiters/applications:
 *   get:
 *     summary: Get all applications for recruiter's jobs
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, shortlisted, interviewed, offered, accepted, rejected]
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
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
 *         description: List of applications
 */
router.get('/applications', verifyToken, authorize('recruiter'), getMyApplications);

/**
 * @swagger
 * /api/recruiters/stats:
 *   get:
 *     summary: Get recruiter statistics
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter statistics
 */
router.get('/stats', verifyToken, authorize('recruiter'), getRecruiterStats);

/**
 * @swagger
 * /api/recruiters/search-talents:
 *   get:
 *     summary: Search talents for a specific job
 *     tags: [Recruiters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *         description: Job ID to find matching talents for
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Required skills (comma-separated)
 *       - in: query
 *         name: experience
 *         schema:
 *           type: number
 *         description: Minimum years of experience
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Preferred location
 *     responses:
 *       200:
 *         description: Matching talents
 */
router.get('/search-talents', verifyToken, authorize('recruiter'), searchTalentsForJob);

module.exports = router; 