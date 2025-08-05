const express = require('express');
const router = express.Router();

const { verifyToken, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadCV, cleanupUpload } = require('../middleware/upload');

// Import talent validators
const {
  validateUpdateTalentProfile,
  validateSearchTalents,
  validateGetTalentBySkill
} = require('../validators/talents');

// Placeholder for talent controller functions
const {
  getTalentProfile,
  updateTalentProfile,
  uploadCV: uploadCVController,
  deleteCV,
  searchTalents,
  getTalentBySkill,
  getAvailableTalents,
  getTalentApplications,
  incrementProfileViews
} = require('../controllers/talentController');

/**
 * @swagger
 * /api/talents/profile:
 *   get:
 *     summary: Get current user's talent profile
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Talent profile retrieved successfully
 *       404:
 *         description: Talent profile not found
 */
router.get('/profile', verifyToken, authorize('talent'), getTalentProfile);

/**
 * @swagger
 * /api/talents/applications:
 *   get:
 *     summary: Get current user's applications
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       404:
 *         description: Talent not found
 */
router.get('/applications', verifyToken, authorize('talent'), getTalentApplications);

/**
 * @swagger
 * /api/talents/profile:
 *   put:
 *     summary: Update talent profile
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [beginner, intermediate, advanced, expert]
 *                     yearsOfExperience:
 *                       type: number
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               availability:
 *                 type: object
 *               salary:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', verifyToken, authorize('talent'), validateUpdateTalentProfile, updateTalentProfile);

/**
 * @swagger
 * /api/talents/cv:
 *   post:
 *     summary: Upload CV
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV uploaded successfully
 */
router.post('/cv', verifyToken, authorize('talent'), uploadCV, uploadCVController, cleanupUpload);

/**
 * @swagger
 * /api/talents/cv:
 *   delete:
 *     summary: Delete CV
 *     tags: [Talents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV deleted successfully
 */
router.delete('/cv', verifyToken, authorize('talent'), deleteCV);

/**
 * @swagger
 * /api/talents/search:
 *   get:
 *     summary: Search talents
 *     tags: [Talents]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, busy, unavailable]
 *         description: Filter by availability
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', optionalAuth, validateSearchTalents, searchTalents);

/**
 * @swagger
 * /api/talents/skills/{skillName}:
 *   get:
 *     summary: Find talents by skill
 *     tags: [Talents]
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill name to search for
 *     responses:
 *       200:
 *         description: Talents with the specified skill
 */
router.get('/skills/:skillName', validateGetTalentBySkill, getTalentBySkill);

/**
 * @swagger
 * /api/talents/available:
 *   get:
 *     summary: Get available talents
 *     tags: [Talents]
 *     responses:
 *       200:
 *         description: List of available talents
 */
router.get('/available', getAvailableTalents);

/**
 * @swagger
 * /api/talents/{talentId}:
 *   get:
 *     summary: Get talent profile by ID
 *     tags: [Talents]
 *     parameters:
 *       - in: path
 *         name: talentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Talent profile retrieved successfully
 *       404:
 *         description: Talent not found
 */
router.get('/:talentId', incrementProfileViews);

module.exports = router; 