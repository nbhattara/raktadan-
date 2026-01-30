const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const {
  searchDonors,
  getDonorStats,
  getTopDonors,
  checkEligibility,
  recordDonation,
  getDonationHistory,
  getDonorCard
} = require('../controllers/donorController');

const router = express.Router();

/**
 * @swagger
 * /api/donors/search:
 *   get:
 *     summary: Search eligible blood donors
 *     tags: [Donors]
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *         description: Required blood group
 *       - in: query
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *         description: Nepal district
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
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Donors found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     donors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Public endpoints
router.get('/search', [
  validate(schemas.pagination, 'query'),
  validate(schemas.district, 'query'),
  validate(schemas.bloodGroup, 'query')
], searchDonors);

/**
 * @swagger
 * /api/donors/stats:
 *   get:
 *     summary: Get donor statistics
 *     tags: [Donors]
 *     responses:
 *       200:
 *         description: Donor statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDonors:
 *                       type: integer
 *                     activeDonors:
 *                       type: integer
 *                     donationsThisMonth:
 *                       type: integer
 *                     livesSaved:
 *                       type: integer
 */
router.get('/stats', getDonorStats);

/**
 * @swagger
 * /api/donors/top:
 *   get:
 *     summary: Get top donors by donations
 *     tags: [Donors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top donors to return
 *     responses:
 *       200:
 *         description: Top donors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/top', getTopDonors);

/**
 * @swagger
 * /api/donors/eligibility:
 *   post:
 *     summary: Check donation eligibility
 *     tags: [Donors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - age
 *               - lastDonation
 *               - medicalConditions
 *             properties:
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 65
 *                 description: Donor age
 *               lastDonation:
 *                 type: string
 *                 format: date
 *                 description: Last donation date (null if never donated)
 *               medicalConditions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of medical conditions
 *     responses:
 *       200:
 *         description: Eligibility check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     eligible:
 *                       type: boolean
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *                     nextEligibleDate:
 *                       type: string
 *                       format: date
 */
router.post('/eligibility', validate(schemas.eligibility), checkEligibility);

// Protected endpoints
/**
 * @swagger
 * /api/donors/donations:
 *   post:
 *     summary: Record a blood donation
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - donationType
 *               - location
 *             properties:
 *               donationType:
 *                 type: string
 *                 enum: [WHOLE_BLOOD, PLATELETS, PLASMA]
 *                 description: Type of donation
 *               location:
 *                 type: string
 *                 description: Donation location
 *               organization:
 *                 type: string
 *                 description: Organization name
 *     responses:
 *       200:
 *         description: Donation recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/donations', auth, validate(schemas.donation), recordDonation);

/**
 * @swagger
 * /api/donors/donations/history:
 *   get:
 *     summary: Get donation history
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: Number of donations per page
 *     responses:
 *       200:
 *         description: Donation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     donations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           donationDate:
 *                             type: string
 *                             format: date
 *                           donationType:
 *                             type: string
 *                           location:
 *                             type: string
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/donations/history', auth, getDonationHistory);

/**
 * @swagger
 * /api/donors/card:
 *   get:
 *     summary: Get donor card information
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donor card information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     donorInfo:
 *                       $ref: '#/components/schemas/User'
 *                     donationStats:
 *                       type: object
 *                       properties:
 *                         totalDonations:
 *                           type: integer
 *                         livesSaved:
 *                           type: integer
 *                         lastDonation:
 *                           type: string
 *                           format: date
 *                     badges:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/card', auth, getDonorCard);

module.exports = router;
