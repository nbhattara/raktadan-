const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const {
  searchAmbulances,
  getEmergencyAmbulances,
  getAmbulanceById,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
  verifyAmbulance,
  rateAmbulance,
  getAmbulanceStats,
  getAmbulancesByDistrict,
  searchNearbyAmbulances
} = require('../controllers/ambulanceController');

const router = express.Router();

/**
 * @swagger
 * /api/ambulances:
 *   get:
 *     summary: Search ambulance services
 *     tags: [Ambulance]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL']
 *         description: Filter by service type
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: ['AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE']
 *         description: Filter by availability status
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in km
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
 *         description: Ambulances retrieved successfully
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
 *                     ambulances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ambulance'
 *                     pagination:
 *                       type: object
 *                     totalCount:
 *                       type: integer
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Public endpoints
router.get('/', searchAmbulances);

/**
 * @swagger
 * /api/ambulances/emergency:
 *   get:
 *     summary: Get emergency available ambulances only
 *     tags: [Ambulance]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 20
 *         description: Search radius in km
 *     responses:
 *       200:
 *         description: Emergency ambulances retrieved successfully
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
 *                     ambulances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ambulance'
 *                     count:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: integer
 *                       description: Average response time in minutes
 */
router.get('/emergency', getEmergencyAmbulances);

/**
 * @swagger
 * /api/ambulances/{ambulanceId}:
 *   get:
 *     summary: Get ambulance by ID
 *     tags: [Ambulance]
 *     parameters:
 *       - in: path
 *         name: ambulanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ambulance unique identifier
 *     responses:
 *       200:
 *         description: Ambulance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   $ref: '#/components/schemas/Ambulance'
 *       404:
 *         description: Ambulance not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:ambulanceId', getAmbulanceById);

// Protected endpoints
/**
 * @swagger
 * /api/ambulances:
 *   post:
 *     summary: Create new ambulance service (Admin only)
 *     tags: [Ambulance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *               - district
 *               - serviceType
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Ambulance service name
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Contact phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact email (optional)
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Service address
 *               district:
 *                 type: string
 *                 description: Service district
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate
 *               serviceType:
 *                 type: string
 *                 enum: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL']
 *                 description: Type of ambulance service
 *               availability:
 *                 type: string
 *                 enum: ['AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE']
 *                 default: AVAILABLE
 *                 description: Initial availability status
 *               responseTime:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 120
 *                 description: Average response time in minutes
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Available equipment list (optional)
 *               operatingHours:
 *                 type: string
 *                 description: Operating hours (optional)
 *     responses:
 *       201:
 *         description: Ambulance created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 message:
 *                   type: string
 *                   example: Ambulance created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ambulance'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth, authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']), validate(schemas.ambulance), createAmbulance);

/**
 * @swagger
 * /api/ambulances/{ambulanceId}/rate:
 *   post:
 *     summary: Rate ambulance service
 *     tags: [Ambulance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ambulanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ambulance unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               review:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Review text (optional)
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid rating or review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ambulance not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:ambulanceId/rate', auth, rateAmbulance);

/**
 * @swagger
 * /api/ambulances/stats:
 *   get:
 *     summary: Get ambulance service statistics
 *     tags: [Ambulance]
 *     responses:
 *       200:
 *         description: Ambulance statistics retrieved successfully
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
 *                     totalAmbulances:
 *                       type: integer
 *                     availableAmbulances:
 *                       type: integer
 *                     verifiedAmbulances:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     averageResponseTime:
 *                       type: number
 *                       description: Average response time in minutes
 *                     ambulancesByDistrict:
 *                       type: object
 *                       description: Ambulance count by district
 *                     ambulancesByServiceType:
 *                       type: object
 *                       description: Ambulance count by service type
 *                     ambulancesByAvailability:
 *                       type: object
 *                       description: Ambulance count by availability status
 */
router.get('/stats', getAmbulanceStats);

/**
 * @swagger
 * /api/ambulances/by-district:
 *   get:
 *     summary: Get ambulances by district
 *     tags: [Ambulance]
 *     parameters:
 *       - in: query
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *         description: District name
 *     responses:
 *       200:
 *         description: Ambulances by district retrieved successfully
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
 *                     district:
 *                       type: string
 *                     ambulances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ambulance'
 *                     count:
 *                       type: integer
 *       400:
 *         description: District is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/by-district', getAmbulancesByDistrict);

/**
 * @swagger
 * /api/ambulances/nearby:
 *   get:
 *     summary: Search nearby ambulances by location
 *     tags: [Ambulance]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in km
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL']
 *         description: Filter by service type (optional)
 *     responses:
 *       200:
 *         description: Nearby ambulances found successfully
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
 *                     ambulances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ambulance'
 *                     count:
 *                       type: integer
 *                     searchRadius:
 *                       type: number
 *                       description: Search radius used in km
 *       400:
 *         description: Latitude and longitude are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/nearby', searchNearbyAmbulances);

module.exports = router;
