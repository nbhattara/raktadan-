const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Send donation impact message to donor
const sendDonationImpactMessage = async (req, res, next) => {
    try {
      const { donationId, message, senderType = 'system' } = req.body;
      const user = req.user;

      // Validate donation exists and user has permission
      const donation = await prisma.donationRecord.findUnique({
        where: { id: donationId },
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              phone: true,
              fcmToken: true,
              email: true,
              totalDonations: true,
              badges: true
            }
          }
        }
      });

      if (!donation) {
        return res.status(404).json({
          status: 'Error',
          message: 'Donation record not found'
        });
      }

      // Check if user is authorized (donor, hospital, or admin)
      const isAuthorized = 
        donation.donorId === user.id || 
        user.role === 'ADMIN' || 
        user.role === 'HOSPITAL';

      if (!isAuthorized) {
        return res.status(403).json({
          status: 'Error',
          message: 'Not authorized to send notification for this donation'
        });
      }

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          recipientId: donation.donorId,
          type: 'DONATION_IMPACT',
          title: 'Your Blood Saved a Life! ❤️',
          message: message || this.generateDefaultImpactMessage(donation),
          senderId: user.id,
          senderType,
          donationId: donation.id,
          metadata: {
            donationDate: donation.donationDate,
            bloodGroup: donation.donor.bloodGroup,
            donationType: donation.donationType,
            location: donation.location,
            organization: donation.organization
          },
          isRead: false,
          priority: 'HIGH'
        }
      });

      // Send push notification if FCM token available
      if (donation.donor.fcmToken) {
        await this.sendPushNotification(donation.donor.fcmToken, {
          title: notification.title,
          message: notification.message,
          data: {
            type: 'DONATION_IMPACT',
            donationId: donation.id,
            notificationId: notification.id
          }
        });
      }

      // Send email if available
      if (donation.donor.email) {
        await this.sendEmailNotification(donation.donor.email, {
          subject: notification.title,
          message: notification.message,
          donorName: donation.donor.name,
          donationDetails: notification.metadata
        });
      }

      // Update donor's lives saved count
      await this.updateLivesSaved(donation.donorId);

      // Award badges if applicable
      await this.checkAndAwardBadges(donation.donorId);

      res.json({
        status: 'Success',
        message: 'Donation impact message sent successfully',
        data: {
          notification,
          deliveryMethods: [
            donation.donor.fcmToken ? 'push' : null,
            donation.donor.email ? 'email' : null,
            'in-app'
          ].filter(Boolean)
        }
      });
    } catch (error) {
      next(error);
    }
  }

// Get notifications for a user
const getNotifications = async (req, res, next) => {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const userId = req.user.id;

      const where = { recipientId: userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }),
        prisma.notification.count({ where })
      ]);

      res.json({
        status: 'Success',
        message: 'Notifications retrieved successfully',
        data: {
          notifications,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            count: total,
            limit: parseInt(limit)
          },
          unreadCount: await prisma.notification.count({
            where: { recipientId: userId, isRead: false }
          })
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
const markAsRead = async (req, res, next) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          recipientId: userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      if (!notification) {
        return res.status(404).json({
          status: 'Error',
          message: 'Notification not found'
        });
      }

      res.json({
        status: 'Success',
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  // Send bulk notification to multiple donors
const sendBulkNotification = async (req, res, next) => {
    try {
      const { donorIds, title, message, senderType = 'system', donationId } = req.body;
      const user = req.user;

      // Validate user is admin or hospital
      if (!['ADMIN', 'HOSPITAL'].includes(user.role)) {
        return res.status(403).json({
          status: 'Error',
          message: 'Not authorized to send bulk notifications'
        });
      }

      const notifications = [];
      
      for (const donorId of donorIds) {
        try {
          const notification = await prisma.notification.create({
            data: {
              recipientId: donorId,
              type: 'BULK_NOTIFICATION',
              title,
              message,
              senderId: user.id,
              senderType,
              donationId,
              isRead: false,
              priority: 'MEDIUM'
            }
          });

          // Get donor details for sending
          const donor = await prisma.user.findUnique({
            where: { id: donorId },
            select: { fcmToken: true, email: true, name: true }
          });

          // Send push notification
          if (donor?.fcmToken) {
            await this.sendPushNotification(donor.fcmToken, {
              title,
              message,
              data: {
                type: 'BULK_NOTIFICATION',
                notificationId: notification.id
              }
            });
          }

          notifications.push(notification);
        } catch (error) {
          console.error(`Failed to send notification to donor ${donorId}:`, error);
        }
      }

      res.json({
        status: 'Success',
        message: `Bulk notification sent to ${notifications.length} donors`,
        data: {
          sentCount: notifications.length,
          requestedCount: donorIds.length,
          failedCount: donorIds.length - notifications.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate default impact message
const generateDefaultImpactMessage = (donation) => {
    const impactMessages = [
      `Your blood donation on ${new Date(donation.donationDate).toLocaleDateString()} is now saving someone's life! ❤️`,
      `Thank you for donating blood! Your contribution on ${new Date(donation.donationDate).toLocaleDateString()} is making a real difference.`,
      `Your blood donation has been used! Someone's heart is beating because of your generosity on ${new Date(donation.donationDate).toLocaleDateString()}.`,
      `Life saved! Your blood donation from ${new Date(donation.donationDate).toLocaleDateString()} is now helping someone in need.`,
      `Your blood is in someone's veins today! Thank you for your life-saving donation on ${new Date(donation.donationDate).toLocaleDateString()}.`
    ];

    // Select a random message or use the first one
    return impactMessages[Math.floor(Math.random() * impactMessages.length)];
  }

  // Send push notification (Firebase)
const sendPushNotification = async (fcmToken, payload) => {
    try {
      const admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        // Initialize Firebase Admin SDK
        const serviceAccount = {
          project_id: config.FIREBASE_PROJECT_ID,
          private_key: config.FIREBASE_PRIVATE_KEY,
          client_email: config.FIREBASE_CLIENT_EMAIL
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      const message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.message,
          sound: 'default',
          badge: '1'
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            color: '#e74c3c'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1
            }
          }
        }
      };

      await admin.messaging().send(message);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Send email notification
const sendEmailNotification = async (email, { subject, message, donorName, donationDetails }) => {
    try {
      // This would integrate with a service like Nodemailer
      console.log('Email notification would be sent:', {
        to: email,
        subject,
        message,
        donorName,
        donationDetails
      });
      
      // For now, just log it
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  // Update lives saved count
const updateLivesSaved = async (donorId) => {
    try {
      // Get current donation count
      const totalDonations = await prisma.donationRecord.count({
        where: { 
          donorId, 
          verified: true 
        }
      });

      // Update user's totalDonations field
      await prisma.user.update({
        where: { id: donorId },
        data: {
          totalDonations
        }
      });

      return totalDonations * 3; // 1 donation = 3 lives saved
    } catch (error) {
      console.error('Failed to update lives saved:', error);
      return 0;
    }
  }

  // Check and award badges
const checkAndAwardBadges = async (donorId) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: donorId },
        select: { totalDonations: true, badges: true }
      });

      if (!user) return;

      const donations = user.totalDonations;
      const currentBadges = user.badges || [];
      const newBadges = [];

      // Check badge milestones
      if (donations >= 1 && !currentBadges.includes('First Donation')) {
        newBadges.push('First Donation');
      }
      if (donations >= 5 && !currentBadges.includes('Regular Donor')) {
        newBadges.push('Regular Donor');
      }
      if (donations >= 10 && !currentBadges.includes('Dedicated Donor')) {
        newBadges.push('Dedicated Donor');
      }
      if (donations >= 25 && !currentBadges.includes('Life Saver')) {
        newBadges.push('Life Saver');
      }
      if (donations >= 50 && !currentBadges.includes('Hero Donor')) {
        newBadges.push('Hero Donor');
      }
      if (donations >= 100 && !currentBadges.includes('Legendary Donor')) {
        newBadges.push('Legendary Donor');
      }

      if (newBadges.length > 0) {
        await prisma.user.update({
          where: { id: donorId },
          data: {
            badges: [...currentBadges, ...newBadges]
          }
        });

        return newBadges;
      }

      return [];
    } catch (error) {
      console.error('Failed to check badges:', error);
      return [];
    }
  }

  // Get notification statistics
const getNotificationStats = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const [
        totalNotifications,
        unreadNotifications,
        todayNotifications,
        impactNotifications
      ] = await Promise.all([
        prisma.notification.count({ where: { recipientId: userId } }),
        prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
        prisma.notification.count({
          where: {
            recipientId: userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.notification.count({
          where: {
            recipientId: userId,
            type: 'DONATION_IMPACT'
          }
        })
      ]);

      res.json({
        status: 'Success',
        message: 'Notification statistics retrieved successfully',
        data: {
          totalNotifications,
          unreadNotifications,
          todayNotifications,
          impactNotifications,
          averageResponseTime: '2.5 hours', // Would be calculated from actual data
          engagementRate: totalNotifications > 0 ? (totalNotifications - unreadNotifications) / totalNotifications * 100 : 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

module.exports = {
  sendDonationImpactMessage,
  getNotifications,
  markAsRead,
  sendBulkNotification,
  getNotificationStats,
  sendPushNotification,
  sendEmailNotification,
  updateLivesSaved,
  checkAndAwardBadges,
  generateDefaultImpactMessage
};
