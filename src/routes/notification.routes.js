const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const {
  sendDonationImpactMessage,
  getNotifications,
  markAsRead,
  sendBulkNotification,
  getNotificationStats
} = require('../controllers/notificationController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DonationImpactRequest:
 *       type: object
 *       required:
 *         - donationId
 *       properties:
 *         donationId:
 *           type: string
 *           description: ID of the donation record
 *         message:
 *           type: string
 *           description: Custom impact message (optional)
 *         senderType:
 *           type: string
 *           enum: [system, hospital, recipient]
 *           default: system
 *           description: Type of sender
 *     BulkNotificationRequest:
 *       type: object
 *       required:
 *         - donorIds
 *         - title
 *         - message
 *       properties:
 *         donorIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of donor IDs
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         senderType:
 *           type: string
 *           enum: [system, hospital, recipient]
 *           default: system
 *         donationId:
 *           type: string
 *           description: Related donation ID (optional)
 */

/**
 * @swagger
 * /api/notifications/donation-impact:
 *   post:
 *     summary: Send donation impact message to donor
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DonationImpactRequest'
 *     responses:
 *       200:
 *         description: Donation impact message sent successfully
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
 *                   example: Donation impact message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification:
 *                       $ref: '#/components/schemas/Notification'
 *                     deliveryMethods:
 *                       type: array
 *                       items:
 *                         type: string
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
 */
router.post('/donation-impact', 
  auth, 
  authorize(['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'SUPER_ADMIN']),
  sendDonationImpactMessage
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
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
 *         description: Number of notifications per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter only unread notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
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
 */
router.get('/', 
  auth, 
  getNotifications
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
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
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:notificationId/read', 
  auth, 
  markAsRead
);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Send bulk notification to multiple donors
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkNotificationRequest'
 *     responses:
 *       200:
 *         description: Bulk notifications sent successfully
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
 *                   example: Bulk notifications sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     requestedCount:
 *                       type: integer
 *                     failedCount:
 *                       type: integer
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
 */
router.post('/bulk', 
  auth, 
  authorize(['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'SUPER_ADMIN']),
  sendBulkNotification
);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
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
 *                     totalNotifications:
 *                       type: integer
 *                     unreadNotifications:
 *                       type: integer
 *                     todayNotifications:
 *                       type: integer
 *                     impactNotifications:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: string
 *                     engagementRate:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', 
  auth, 
  getNotificationStats
);

module.exports = router;
