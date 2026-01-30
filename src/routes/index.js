const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const donorRoutes = require('./donor.routes');
const ambulanceRoutes = require('./ambulance.routes');
const hospitalRoutes = require('./hospital.routes');
const inventoryRoutes = require('./inventory.routes');
const emergencyRoutes = require('./emergency.routes');
const notificationRoutes = require('./notification.routes');

// Root route
router.get('/', (req, res) => {
  res.json({
    status: 'Success',
    message: '🩸 Welcome to Raktadan API - Nepal Blood Donation Platform',
    data: {
      name: 'Raktadan Backend API',
      version: '1.0.0',
      purpose: 'Life-saving blood donation & ambulance services for Nepal',
      endpoints: {
        health: '/health',
        docs: '/docs',
        swagger: '/api-docs',
        auth: '/api/auth',
        users: '/api/users',
        donors: '/api/donors',
        ambulances: '/api/ambulances',
        bloodRequests: '/api/blood-requests',
        inventory: '/api/inventory',
        emergency: '/api/emergency',
        notifications: '/api/notifications'
      },
      emergencyContacts: {
        bloodEmergency: '1155',
        ambulance: '1155',
        general: '1155'
      },
      features: [
        'Blood donation management',
        'Emergency ambulance services',
        'Donor-recipient matching',
        'Real-time notifications',
        'Hospital inventory tracking',
        'Emergency response system',
        'Swagger API documentation'
      ],
      documentation: {
        swagger: 'http://localhost:3000/api-docs',
        apiDocs: 'http://localhost:3000/docs'
      }
    }
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Raktadan Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    purpose: 'Life-saving blood donation & ambulance platform for Nepal'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/ambulances', ambulanceRoutes);
router.use('/blood-requests', hospitalRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/notifications', notificationRoutes);

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    status: 'Success',
    message: 'Raktadan API Documentation',
    data: {
      title: 'Raktadan Blood Donation & Emergency API',
      version: '1.0.0',
      description: 'Life-saving platform connecting blood donors, patients, and ambulance services in Nepal',
      purpose: 'Reduce time to find compatible blood donors and emergency medical transport',
      core_features: [
        'Emergency blood donor search',
        'Voluntary blood donation promotion',
        'Ambulance service directory',
        'Donor recognition & tracking',
        'Real-time emergency response',
        'Donor impact notifications'
      ],
      endpoints: {
        auth: {
          'POST /auth/register': 'Register a new donor',
          'POST /auth/login': 'User login',
          'GET /auth/profile': 'Get user profile',
          'PUT /auth/profile': 'Update user profile'
        },
        donors: {
          'GET /donors/search': 'Search eligible donors',
          'GET /donors/stats': 'Get donor statistics',
          'GET /donors/top': 'Get top donors',
          'GET /donors/eligibility': 'Check donation eligibility',
          'POST /donors/donations': 'Record a donation',
          'GET /donors/donations/history': 'Get donation history',
          'GET /donors/card': 'Get donor card information'
        },
        ambulances: {
          'GET /ambulances': 'Search ambulance services',
          'GET /ambulances/emergency': 'Get emergency ambulances',
          'GET /ambulances/:id': 'Get ambulance by ID',
          'POST /ambulances': 'Create ambulance (admin)',
          'PUT /ambulances/:id': 'Update ambulance (admin)',
          'DELETE /ambulances/:id': 'Delete ambulance (admin)',
          'POST /ambulances/:id/verify': 'Verify ambulance (admin)',
          'POST /ambulances/:id/rate': 'Rate ambulance',
          'GET /ambulances/stats': 'Get ambulance statistics',
          'GET /ambulances/by-district': 'Get ambulances by district',
          'GET /ambulances/nearby': 'Search nearby ambulances'
        },
        'blood-requests': {
          'POST /blood-requests': 'Create blood request',
          'GET /blood-requests': 'Get blood requests',
          'GET /blood-requests/search': 'Search blood requests',
          'POST /blood-requests/:id/respond': 'Respond to blood request',
          'PUT /blood-requests/:id/status': 'Update request status',
          'GET /blood-requests/stats': 'Get request statistics',
          'GET /blood-requests/by-blood-group': 'Get requests by blood group'
        },
        inventory: {
          'GET /inventory/summary': 'Get blood inventory summary',
          'GET /inventory/district': 'Get inventory by district',
          'GET /inventory/critical': 'Get critical shortages',
          'GET /inventory/trends': 'Get donation trends',
          'PUT /inventory': 'Update inventory (admin)'
        },
        emergency: {
          'POST /emergency/blood': 'Emergency blood donor finder',
          'POST /emergency/ambulance': 'Emergency ambulance finder',
          'POST /emergency/log': 'Log emergency request',
          'GET /emergency/stats': 'Emergency statistics',
          'GET /emergency/contacts': 'Emergency contact numbers',
          'GET /emergency/guidelines': 'Emergency guidelines'
        },
        notifications: {
          'POST /notifications/donation-impact': 'Send donation impact message',
          'GET /notifications': 'Get user notifications',
          'PUT /notifications/:id/read': 'Mark notification as read',
          'POST /notifications/bulk': 'Send bulk notification (admin)',
          'GET /notifications/stats': 'Notification statistics',
          'GET /notifications/unread-count': 'Get unread count',
          'PUT /notifications/mark-all-read': 'Mark all as read',
          'DELETE /notifications/:id': 'Delete notification'
        }
      },
      emergency_features: {
        '90-day donation eligibility': 'Automatic filtering based on last donation date',
        'lives_saved_calculation': '1 donation = 3 lives saved',
        'nepal_district_coverage': 'All 77 districts supported',
        'emergency_response_optimization': 'Prioritized for critical cases',
        'real_time_availability': 'Donor availability status tracking',
        'donor_impact_notifications': 'Automatic messages when blood is used'
      },
      notification_features: {
        'push_notifications': 'Firebase Cloud Messaging integration',
        'email_notifications': 'Email delivery for important updates',
        'in_app_notifications': 'Real-time notification center',
        'badge_system': 'Automatic badge awarding for milestones',
        'impact_messages': 'Personalized messages when donation saves lives'
      },
      authentication: 'Bearer token required for protected endpoints',
      rate_limiting: '100 requests per 15 minutes per IP',
      support: 'For emergencies: call 1155 | For support: contact admin@raktadan.com'
    }
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'Error',
    message: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/docs',
      '/api/auth',
      '/api/donors',
      '/api/ambulances',
      '/api/blood-requests',
      '/api/inventory',
      '/api/emergency',
      '/api/notifications'
    ],
    emergency_contacts: {
      health: '1155',
      police: '100',
      fire: '101',
      traffic: '103'
    }
  });
});

module.exports = router;
