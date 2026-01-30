const express = require('express');
const { validate, schemas } = require('../middleware/validate');
const {
  findEmergencyDonors,
  findEmergencyAmbulance,
  logEmergencyRequest,
  getEmergencyStats
} = require('../controllers/emergencyController');

const router = express.Router();

/**
 * @swagger
 * /api/emergency/blood:
 *   post:
 *     summary: Emergency blood donor finder - optimized for speed
 *     tags: [Emergency]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bloodGroup
 *               - location
 *               - urgency
 *             properties:
 *               bloodGroup:
 *                 type: string
 *                 enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *                 description: Required blood group
 *               location:
 *                 type: string
 *                 minLength: 3
 *                 description: Emergency location (hospital, address, landmark)
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate (optional but recommended)
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate (optional but recommended)
 *               urgency:
 *                 type: string
 *                 enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
 *                 description: Emergency urgency level
 *               unitsRequired:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 1
 *                 description: Number of blood units required
 *               patientName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Patient name (optional)
 *               patientAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 120
 *                 description: Patient age (optional)
 *               patientGender:
 *                 type: string
 *                 enum: ['MALE', 'FEMALE', 'OTHER']
 *                 description: Patient gender (optional)
 *               contactPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Contact phone number
 *               medicalNotes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional medical information (optional)
 *     responses:
 *       200:
 *         description: Emergency donors found successfully
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
 *                   example: Emergency donors found
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       description: Emergency request ID for tracking
 *                     donors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     count:
 *                       type: integer
 *                       description: Number of eligible donors found
 *                     estimatedResponseTime:
 *                       type: string
 *                       description: Estimated average response time
 *                     nearbyCount:
 *                       type: integer
 *                       description: Number of donors within 5km radius
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No donors found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: No eligible donors found in the area
 */
// Emergency blood finder - optimized for speed
router.post('/blood', async (req, res, next) => {
  try {
    const result = await findEmergencyDonors(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emergency/ambulance:
 *   post:
 *     summary: Find emergency ambulance services
 *     tags: [Emergency]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - urgency
 *             properties:
 *               location:
 *                 type: string
 *                 minLength: 3
 *                 description: Emergency location (hospital, address, landmark)
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate (optional but recommended)
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate (optional but recommended)
 *               urgency:
 *                 type: string
 *                 enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
 *                 description: Emergency urgency level
 *               serviceType:
 *                 type: string
 *                 enum: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL']
 *                 description: Required ambulance service type (optional)
 *               patientCondition:
 *                 type: string
 *                 maxLength: 500
 *                 description: Patient condition details (optional)
 *               contactPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Contact phone number
 *               destinationHospital:
 *                 type: string
 *                 maxLength: 100
 *                 description: Destination hospital (optional)
 *               estimatedDistance:
 *                 type: number
 *                 description: Estimated distance in km (optional)
 *     responses:
 *       200:
 *         description: Emergency ambulances found successfully
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
 *                   example: Emergency ambulances found
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       description: Emergency request ID for tracking
 *                     ambulances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ambulance'
 *                     count:
 *                       type: integer
 *                       description: Number of available ambulances found
 *                     nearestAmbulance:
 *                       $ref: '#/components/schemas/Ambulance'
 *                     averageResponseTime:
 *                       type: integer
 *                       description: Average response time in minutes
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No ambulances available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: No ambulances available in the area
 */
router.post('/ambulance', async (req, res, next) => {
  try {
    const result = await findEmergencyAmbulance(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emergency:
 *   post:
 *     summary: Log emergency request (both blood and ambulance)
 *     tags: [Emergency]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyRequest'
 *     responses:
 *       201:
 *         description: Emergency request logged successfully
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
 *                   example: Emergency request logged successfully
 *                 data:
 *                   $ref: '#/components/schemas/EmergencyRequest'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res, next) => {
  try {
    const result = await logEmergencyRequest(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emergency/stats:
 *   get:
 *     summary: Get emergency services statistics
 *     tags: [Emergency]
 *     responses:
 *       200:
 *         description: Emergency statistics retrieved successfully
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
 *                     totalEmergencyRequests:
 *                       type: integer
 *                     activeEmergencies:
 *                       type: integer
 *                     bloodEmergencies:
 *                       type: integer
 *                     ambulanceEmergencies:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: number
 *                       description: Average response time in minutes
 *                     emergenciesByDistrict:
 *                       type: object
 *                       description: Emergency count by district
 *                     emergenciesByUrgency:
 *                       type: object
 *                       description: Emergency count by urgency level
 *                     resolvedToday:
 *                       type: integer
 *                       description: Number of emergencies resolved today
 */
router.get('/stats', async (req, res, next) => {
  try {
    const result = await getEmergencyStats(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
