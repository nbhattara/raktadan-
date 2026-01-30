const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/users/toggle-role:
 *   post:
 *     summary: Toggle user role between DONOR and RECIPIENT
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newRole
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [DONOR, RECIPIENT]
 *                 description: New role to switch to
 *     responses:
 *       200:
 *         description: Role toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid role or cannot toggle
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
router.post('/toggle-role', 
  auth, 
  authorize(['DONOR', 'RECIPIENT']),
  validate(schemas.toggleRole),
  UserController.toggleRole
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile with role-specific data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isDonor:
 *                       type: boolean
 *                     isRecipient:
 *                       type: boolean
 *                     canToggleRole:
 *                       type: boolean
 *                     bloodGroup:
 *                       type: string
 *                     totalDonations:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', 
  auth, 
  UserController.getProfile
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               bloodGroup:
 *                 type: string
 *                 enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 65
 *               gender:
 *                 type: string
 *                 enum: ['MALE', 'FEMALE', 'OTHER']
 *               address:
 *                 type: string
 *                 maxLength: 500
 *               city:
 *                 type: string
 *                 maxLength: 100
 *               district:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
router.put('/profile', 
  auth, 
  validate(schemas.updateProfile),
  UserController.updateProfile
);

/**
 * @swagger
 * /api/users/login-update:
 *   post:
 *     summary: Update last login timestamp
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last login updated
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
router.post('/login-update', 
  auth, 
  UserController.updateLastLogin
);

/**
 * @swagger
 * /api/users/eligible-donors:
 *   get:
 *     summary: Get eligible donors for blood requests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         name: excludeRecent
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Exclude donors who donated recently
 *     responses:
 *       200:
 *         description: Eligible donors retrieved successfully
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
 *                     count:
 *                       type: integer
 *       400:
 *         description: Missing required parameters
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
router.get('/eligible-donors', 
  auth, 
  authorize(['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'SUPER_ADMIN']),
  UserController.getEligibleDonors
);

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     donorUsers:
 *                       type: integer
 *                     recipientUsers:
 *                       type: integer
 *                     hospitalAdmins:
 *                       type: integer
 *                     bloodBankStaff:
 *                       type: integer
 *                     superAdmins:
 *                       type: integer
 *                     roleDistribution:
 *                       type: object
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
router.get('/statistics', 
  auth, 
  authorize(['SUPER_ADMIN']),
  UserController.getUserStatistics
);

// Admin routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'DONOR', 'RECIPIENT']
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
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
router.get('/', 
  auth, 
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  UserController.getAllUsers
);

/**
 * @swagger
 * /api/users/{userId}/approve:
 *   put:
 *     summary: Approve user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to approve
 *     responses:
 *       200:
 *         description: User approved successfully
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:userId/approve', 
  auth, 
  authorize(['SUPER_ADMIN', 'HOSPITAL_ADMIN']),
  UserController.approveUser
);

/**
 * @swagger
 * /api/users/{userId}/deactivate:
 *   put:
 *     summary: Deactivate user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
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
 *       403:
 *         description: Forbidden - Super Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:userId/deactivate', 
  auth, 
  authorize(['SUPER_ADMIN']),
  UserController.deactivateUser
);

// Hospital specific routes
/**
 * @swagger
 * /api/users/hospital/{hospitalId}/staff:
 *   get:
 *     summary: Get hospital staff (Hospital Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital staff retrieved successfully
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
 *                     staff:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Hospital Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/hospital/:hospitalId/staff', 
  auth, 
  authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']),
  UserController.getHospitalStaff
);

module.exports = router;
