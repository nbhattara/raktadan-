const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raktadan API',
      version: '1.0.0',
      description: '🩸 Raktadan Blood Donation Platform API - Nepal Blood Donation & Emergency Services',
      contact: {
        name: 'API Support',
        email: 'support@raktadan.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.raktadan.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'Ram Bahadur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'ram@example.com'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '9841234567'
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'DONOR', 'RECIPIENT'],
              description: 'User role'
            },
            bloodGroup: {
              type: 'string',
              enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
              description: 'Blood group'
            },
            gender: {
              type: 'string',
              enum: ['MALE', 'FEMALE', 'OTHER'],
              description: 'Gender'
            },
            age: {
              type: 'integer',
              minimum: 18,
              maximum: 65,
              description: 'Age'
            },
            district: {
              type: 'string',
              description: 'Nepal district',
              example: 'Kathmandu'
            },
            isActive: {
              type: 'boolean',
              description: 'User active status'
            },
            isApproved: {
              type: 'boolean',
              description: 'User approval status'
            },
            isDonor: {
              type: 'boolean',
              description: 'Whether user is a donor'
            },
            isRecipient: {
              type: 'boolean',
              description: 'Whether user is a recipient'
            },
            canToggleRole: {
              type: 'boolean',
              description: 'Whether user can toggle between donor/recipient'
            }
          }
        },
        BloodRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Blood request unique identifier'
            },
            patientName: {
              type: 'string',
              description: 'Patient name',
              example: 'Sita Sharma'
            },
            patientAge: {
              type: 'integer',
              description: 'Patient age',
              example: 35
            },
            patientGender: {
              type: 'string',
              enum: ['MALE', 'FEMALE', 'OTHER'],
              description: 'Patient gender'
            },
            bloodGroup: {
              type: 'string',
              enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
              description: 'Required blood group'
            },
            unitsRequired: {
              type: 'integer',
              description: 'Number of blood units required',
              example: 2
            },
            urgency: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              description: 'Urgency level'
            },
            hospitalName: {
              type: 'string',
              description: 'Hospital name',
              example: 'Teaching Hospital'
            },
            hospitalAddress: {
              type: 'string',
              description: 'Hospital address',
              example: 'Maharajgunj, Kathmandu'
            },
            requiredBy: {
              type: 'string',
              format: 'date-time',
              description: 'Required by date'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
              description: 'Request status'
            },
            requesterId: {
              type: 'string',
              description: 'Requester user ID'
            }
          }
        },
        Ambulance: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Ambulance unique identifier'
            },
            name: {
              type: 'string',
              description: 'Ambulance service name',
              example: 'City Ambulance Service'
            },
            phone: {
              type: 'string',
              description: 'Contact phone number',
              example: '9841234567'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email',
              example: 'ambulance@example.com'
            },
            address: {
              type: 'string',
              description: 'Service address',
              example: 'Thamel, Kathmandu'
            },
            district: {
              type: 'string',
              description: 'Service district',
              example: 'Kathmandu'
            },
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
              example: 27.7172
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
              example: 85.3240
            },
            serviceType: {
              type: 'string',
              enum: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL'],
              description: 'Type of ambulance service'
            },
            availability: {
              type: 'string',
              enum: ['AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE'],
              description: 'Current availability status'
            },
            isVerified: {
              type: 'boolean',
              description: 'Verification status'
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating'
            },
            responseTime: {
              type: 'integer',
              description: 'Average response time in minutes',
              example: 15
            }
          }
        },
        EmergencyRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Emergency request unique identifier'
            },
            type: {
              type: 'string',
              enum: ['BLOOD', 'AMBULANCE', 'BOTH'],
              description: 'Emergency type'
            },
            bloodGroup: {
              type: 'string',
              enum: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
              description: 'Required blood group (if blood emergency)'
            },
            unitsRequired: {
              type: 'integer',
              description: 'Blood units required (if blood emergency)',
              example: 3
            },
            urgency: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              description: 'Emergency urgency level'
            },
            location: {
              type: 'string',
              description: 'Emergency location',
              example: 'Patan Hospital, Lalitpur'
            },
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
              example: 27.6587
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
              example: 85.3247
            },
            patientName: {
              type: 'string',
              description: 'Patient name (if applicable)',
              example: 'Gopal Sharma'
            },
            patientAge: {
              type: 'integer',
              description: 'Patient age (if applicable)',
              example: 45
            },
            patientGender: {
              type: 'string',
              enum: ['MALE', 'FEMALE', 'OTHER'],
              description: 'Patient gender (if applicable)'
            },
            contactPhone: {
              type: 'string',
              description: 'Contact phone number',
              example: '9841234567'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'],
              description: 'Emergency status'
            },
            requesterId: {
              type: 'string',
              description: 'Requester user ID'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Notification unique identifier'
            },
            type: {
              type: 'string',
              enum: ['DONATION_IMPACT', 'BULK_NOTIFICATION', 'SYSTEM_UPDATE', 'BADGE_EARNED', 'APPOINTMENT_REMINDER'],
              description: 'Notification type'
            },
            title: {
              type: 'string',
              description: 'Notification title',
              example: 'Your Blood Saved a Life! ❤️'
            },
            message: {
              type: 'string',
              description: 'Notification message',
              example: 'Your blood donation on Jan 15, 2024 is now saving someone\'s life!'
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              description: 'Notification priority'
            },
            isRead: {
              type: 'boolean',
              description: 'Whether notification is read'
            },
            recipientId: {
              type: 'string',
              description: 'Recipient user ID'
            },
            senderId: {
              type: 'string',
              description: 'Sender user ID'
            },
            senderType: {
              type: 'string',
              enum: ['system', 'hospital', 'recipient'],
              description: 'Sender type'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'Error'
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'Success'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Donors',
        description: 'Blood donor operations'
      },
      {
        name: 'Blood Requests',
        description: 'Blood request management'
      },
      {
        name: 'Notifications',
        description: 'Notification system'
      },
      {
        name: 'Emergency',
        description: 'Emergency services'
      },
      {
        name: 'Ambulance',
        description: 'Ambulance services'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
