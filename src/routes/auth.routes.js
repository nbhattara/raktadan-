const express = require('express');
const rateLimit = require('express-rate-limit');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

// Rate limiting for OTP endpoints
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 minutes per IP
  message: {
    status: 'Error',
    message: 'Too many OTP requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for login attempts
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes per IP
  message: {
    status: 'Error',
    message: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    status: 'Error',
    message: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @swagger
 * components:
 *   schemas:
 *     InitiateRegistrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - bloodGroup
 *         - age
 *         - gender
 *         - district
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Full name
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Password
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: Phone number
 *         bloodGroup:
 *           type: string
 *           enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *           description: Blood group
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 65
 *           description: Age
 *         gender:
 *           type: string
 *           enum: ['MALE', 'FEMALE', 'OTHER']
 *           description: Gender
 *         district:
 *           type: string
 *           description: District
 *     CompleteRegistrationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - otp
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - bloodGroup
 *         - age
 *         - gender
 *         - district
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID received from initiate registration
 *         otp:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           description: 6-digit OTP sent to email
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Full name
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Password
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: Phone number
 *         bloodGroup:
 *           type: string
 *           enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *           description: Blood group
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 65
 *           description: Age
 *         gender:
 *           type: string
 *           enum: ['MALE', 'FEMALE', 'OTHER']
 *           description: Gender
 *         district:
 *           type: string
 *           description: District
 *     LoginRequest:
 *       type: object
 *       required:
 *         - userId
 *         - password
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID (received during registration)
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Password
 *         totpCode:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           description: 6-digit TOTP code (if 2FA enabled)
 *     Enable2FARequest:
 *       type: object
 *       required:
 *         - totpCode
 *       properties:
 *         totpCode:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           description: 6-digit TOTP code from authenticator app
 *     Disable2FARequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Current password for verification
 */

/**
 * @swagger
 * /api/auth/register/initiate:
 *   post:
 *     summary: Initiate user registration (sends OTP)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateRegistrationRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent to your email. Please verify to complete registration.
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: User ID for completing registration
 *                     email:
 *                       type: string
 *                       description: Email address
 *       400:
 *         description: Bad request or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register/initiate', validate(schemas.registration), authController.initiateRegistration);

/**
 * @swagger
 * /api/auth/register/complete:
 *   post:
 *     summary: Complete user registration with OTP verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteRegistrationRequest'
 *     responses:
 *       201:
 *         description: Registration completed successfully
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
 *                   example: Registration completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                     otpSecret:
 *                       type: string
 *                       description: TOTP secret for 2FA setup
 *                     qrCode:
 *                       type: string
 *                       description: QR code for TOTP setup
 *       400:
 *         description: Invalid OTP or registration data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register/complete', authRateLimit, authController.completeRegistration);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with user ID and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                     isOtpEnabled:
 *                       type: boolean
 *                       description: Whether 2FA is enabled
 *       401:
 *         description: Invalid credentials or TOTP code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   get:
 *     summary: Get 2FA setup information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup information retrieved
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
 *                   example: 2FA setup information
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                       description: TOTP secret
 *                     qrCode:
 *                       type: string
 *                       description: QR code for authenticator app
 *                     isOtpEnabled:
 *                       type: boolean
 *                       description: Current 2FA status
 *                     instructions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Setup instructions
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/2fa/setup', auth, authController.get2FASetup);

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enable2FARequest'
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid TOTP code
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
router.post('/2fa/enable', auth, authController.enable2FA);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Disable2FARequest'
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Invalid password or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/2fa/disable', auth, authController.disable2FA);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
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
router.get('/profile', auth, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
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
 *                 description: Full name
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Phone number
 *               bloodGroup:
 *                 type: string
 *                 enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
 *                 description: Blood group
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 65
 *                 description: Age
 *               gender:
 *                 type: string
 *                 enum: ['MALE', 'FEMALE', 'OTHER']
 *                 description: Gender
 *               district:
 *                 type: string
 *                 description: District
 *               address:
 *                 type: string
 *                 maxLength: 500
 *                 description: Address
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 description: City
 *               isAvailable:
 *                 type: boolean
 *                 description: Donor availability status
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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
router.put('/profile', auth, validate(schemas.profileUpdate), authController.updateProfile);

module.exports = router;
