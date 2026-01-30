const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const {
  createBloodRequest,
  getBloodRequests,
  searchBloodRequests,
  respondToBloodRequest,
  updateBloodRequestStatus,
  getBloodRequestStats,
  getBloodRequestsByBloodGroup
} = require('../controllers/hospitalController');

const router = express.Router();

/**
 * @swagger
 * /api/blood-requests/search:
 *   get:
 *     summary: Search blood requests
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *           enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *         description: Filter by blood group
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
 *         description: Filter by urgency level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED']
 *         description: Filter by status
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
 *         description: Blood requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BloodRequest'
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Public endpoints
router.get('/search', [
  validate(schemas.pagination, 'query'),
  validate(schemas.bloodGroup, 'query'),
  validate(schemas.district, 'query')
], searchBloodRequests);

/**
 * @swagger
 * /api/blood-requests/stats:
 *   get:
 *     summary: Get blood request statistics
 *     tags: [Blood Requests]
 *     responses:
 *       200:
 *         description: Blood request statistics retrieved successfully
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
 *                     totalRequests:
 *                       type: integer
 *                     pendingRequests:
 *                       type: integer
 *                     fulfilledRequests:
 *                       type: integer
 *                     criticalRequests:
 *                       type: integer
 *                     requestsByBloodGroup:
 *                       type: object
 *                     requestsByDistrict:
 *                       type: object
 */
router.get('/stats', getBloodRequestStats);

/**
 * @swagger
 * /api/blood-requests/by-blood-group:
 *   get:
 *     summary: Get blood requests grouped by blood group
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *         description: Blood group to filter by
 *     responses:
 *       200:
 *         description: Blood requests by blood group retrieved successfully
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
 *                     bloodGroup:
 *                       type: string
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BloodRequest'
 *                     count:
 *                       type: integer
 *       400:
 *         description: Blood group is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/by-blood-group', getBloodRequestsByBloodGroup);

// Protected endpoints
/**
 * @swagger
 * /api/blood-requests:
 *   post:
 *     summary: Create a new blood request
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientName
 *               - patientAge
 *               - patientGender
 *               - bloodGroup
 *               - unitsRequired
 *               - urgency
 *               - hospitalName
 *               - hospitalAddress
 *               - requiredBy
 *             properties:
 *               patientName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Patient full name
 *               patientAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 120
 *                 description: Patient age
 *               patientGender:
 *                 type: string
 *                 enum: ['MALE', 'FEMALE', 'OTHER']
 *                 description: Patient gender
 *               bloodGroup:
 *                 type: string
 *                 enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *                 description: Required blood group
 *               unitsRequired:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Number of blood units required
 *               urgency:
 *                 type: string
 *                 enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
 *                 description: Urgency level
 *               hospitalName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Hospital name
 *               hospitalAddress:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Hospital address
 *               requiredBy:
 *                 type: string
 *                 format: date-time
 *                 description: Required by date and time
 *               medicalNotes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Additional medical notes (optional)
 *               contactPerson:
 *                 type: string
 *                 maxLength: 100
 *                 description: Contact person name (optional)
 *               contactPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Contact phone number (optional)
 *     responses:
 *       201:
 *         description: Blood request created successfully
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
 *                   example: Blood request created successfully
 *                 data:
 *                   $ref: '#/components/schemas/BloodRequest'
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
 */
router.post('/', auth, validate(schemas.bloodRequest), createBloodRequest);

/**
 * @swagger
 * /api/blood-requests:
 *   get:
 *     summary: Get blood requests (authenticated user)
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED']
 *         description: Filter by status
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
 *         description: Blood requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BloodRequest'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, [
  validate(schemas.pagination, 'query'),
  validate(schemas.status, 'query')
], getBloodRequests);

/**
 * @swagger
 * /api/blood-requests/{requestId}/respond:
 *   post:
 *     summary: Respond to a blood request (donor response)
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blood request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: ['ACCEPTED', 'DECLINED']
 *                 description: Response type
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional message (optional)
 *               availableDate:
 *                 type: string
 *                 format: date-time
 *                 description: Available donation date (if accepted)
 *     responses:
 *       200:
 *         description: Response submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid response or request not available
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
 *         description: Blood request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:requestId/respond', auth, respondToBloodRequest);

/**
 * @swagger
 * /api/blood-requests/{requestId}/status:
 *   put:
 *     summary: Update blood request status (hospital/admin only)
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blood request ID
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
 *                 enum: ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED']
 *                 description: New status
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Status change notes (optional)
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid status transition
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
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Blood request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:requestId/status', auth, authorize(['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'SUPER_ADMIN']), updateBloodRequestStatus);

module.exports = router;
