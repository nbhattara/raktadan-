const Joi = require('joi');
const config = require('../config');

// Common validation schemas
const schemas = {
  // User registration initiation
  registration: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^(\+977)?[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number (e.g., 9841234567 or +9779841234567)',
      'any.required': 'Phone number is required'
    }),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required().messages({
      'any.only': 'Invalid blood group',
      'any.required': 'Blood group is required'
    }),
    age: Joi.number().integer().min(18).max(65).required().messages({
      'number.min': 'Minimum age for donation is 18 years',
      'number.max': 'Maximum age for donation is 65 years',
      'any.required': 'Age is required'
    }),
    gender: Joi.string().valid(...config.GENDERS).required().messages({
      'any.only': 'Invalid gender',
      'any.required': 'Gender is required'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required().messages({
      'any.only': 'Invalid district',
      'any.required': 'District is required'
    })
  }),

  // Complete registration with OTP
  completeRegistration: Joi.object({
    userId: Joi.string().required().messages({
      'any.required': 'User ID is required'
    }),
    otp: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'OTP must be a 6-digit number',
      'any.required': 'OTP is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(config.PHONE_PATTERN).required().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number',
      'any.required': 'Phone number is required'
    }),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required().messages({
      'any.only': 'Invalid blood group',
      'any.required': 'Blood group is required'
    }),
    age: Joi.number().integer().min(18).max(65).required().messages({
      'number.min': 'Minimum age for donation is 18 years',
      'number.max': 'Maximum age for donation is 65 years',
      'any.required': 'Age is required'
    }),
    gender: Joi.string().valid(...config.GENDERS).required().messages({
      'any.only': 'Invalid gender',
      'any.required': 'Gender is required'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required().messages({
      'any.only': 'Invalid district',
      'any.required': 'District is required'
    })
  }),

  // Simplified login with user ID
  login: Joi.object({
    userId: Joi.string().required().messages({
      'any.required': 'User ID is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
    totpCode: Joi.string().pattern(/^\d{6}$/).optional().messages({
      'string.pattern.base': 'TOTP code must be a 6-digit number'
    })
  }),

  // 2FA enable
  enable2FA: Joi.object({
    totpCode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'TOTP code must be a 6-digit number',
      'any.required': 'TOTP code is required'
    })
  }),

  // 2FA disable
  disable2FA: Joi.object({
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    })
  }),

  // Profile update
  profileUpdate: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    phone: Joi.string().pattern(config.PHONE_PATTERN).optional().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number'
    }),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).optional().messages({
      'any.only': 'Invalid blood group'
    }),
    age: Joi.number().integer().min(18).max(65).optional().messages({
      'number.min': 'Minimum age for donation is 18 years',
      'number.max': 'Maximum age for donation is 65 years'
    }),
    gender: Joi.string().valid(...config.GENDERS).optional().messages({
      'any.only': 'Invalid gender'
    }),
    address: Joi.string().max(500).optional().messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    city: Joi.string().max(100).optional().messages({
      'string.max': 'City cannot exceed 100 characters'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).optional().messages({
      'any.only': 'Invalid district'
    }),
    isAvailable: Joi.boolean().optional().messages({
      'boolean.base': 'isAvailable must be a boolean'
    }),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().pattern(config.PHONE_PATTERN).optional(),
      relationship: Joi.string().optional()
    }).optional()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
  }),

  // Blood group
  bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required().messages({
    'any.only': 'Invalid blood group',
      'any.required': 'Blood group is required'
    }),

  // District
  district: Joi.string().valid(...config.NEPAL_DISTRICTS).required().messages({
    'any.only': 'Invalid district',
      'any.required': 'District is required'
  }),

  // User role toggle
  roleToggle: Joi.object({
    newRole: Joi.string().valid('DONOR', 'RECIPIENT').required().messages({
      'any.only': 'Invalid role. Must be DONOR or RECIPIENT',
      'any.required': 'New role is required'
    })
  }),

  // Update profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email'
    }),
    phone: Joi.string().pattern(config.PHONE_PATTERN).optional().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number'
    }),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).optional().messages({
      'any.only': 'Invalid blood group'
    }),
    age: Joi.number().integer().min(18).max(65).optional().messages({
      'number.min': 'Minimum age for donation is 18 years',
      'number.max': 'Maximum age for donation is 65 years'
    }),
    gender: Joi.string().valid(...config.GENDERS).optional().messages({
      'any.only': 'Invalid gender'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).optional().messages({
      'any.only': 'Invalid district'
    }),
    address: Joi.string().max(500).optional().messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().pattern(config.PHONE_PATTERN).optional(),
      relationship: Joi.string().optional()
    }).optional()
  }),

  // User approval
  userApproval: Joi.object({
    isApproved: Joi.boolean().required().messages({
      'boolean.base': 'isApproved must be a boolean',
      'any.required': 'isApproved is required'
    })
  }),

  // Donation record
  donation: Joi.object({
    donationType: Joi.string().valid('WHOLE_BLOOD', 'PLATELETS', 'PLASMA').required().messages({
      'any.only': 'Invalid donation type',
      'any.required': 'Donation type is required'
    }),
    location: Joi.string().min(5).max(200).required().messages({
      'string.min': 'Location must be at least 5 characters',
      'string.max': 'Location cannot exceed 200 characters',
      'any.required': 'Location is required'
    }),
    organization: Joi.string().max(100).optional().messages({
      'string.max': 'Organization name cannot exceed 100 characters'
    }),
    notes: Joi.string().max(1000).optional().messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    })
  }),

  // Blood request
  bloodRequest: Joi.object({
    patientName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Patient name must be at least 2 characters',
      'string.max': 'Patient name cannot exceed 100 characters',
      'any.required': 'Patient name is required'
    }),
    patientAge: Joi.number().integer().min(0).max(120).required().messages({
      'number.min': 'Patient age cannot be negative',
      'number.max': 'Patient age cannot exceed 120 years',
      'any.required': 'Patient age is required'
    }),
    patientGender: Joi.string().valid(...config.GENDERS).required().messages({
      'any.only': 'Invalid patient gender',
      'any.required': 'Patient gender is required'
    }),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required().messages({
      'any.only': 'Invalid blood group',
      'any.required': 'Blood group is required'
    }),
    unitsRequired: Joi.number().integer().min(1).max(10).required().messages({
      'number.min': 'At least 1 unit is required',
      'number.max': 'Maximum 10 units can be requested',
      'any.required': 'Units required is required'
    }),
    urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required().messages({
      'any.only': 'Invalid urgency level',
      'any.required': 'Urgency level is required'
    }),
    hospitalName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Hospital name must be at least 2 characters',
      'string.max': 'Hospital name cannot exceed 100 characters',
      'any.required': 'Hospital name is required'
    }),
    hospitalAddress: Joi.string().min(5).max(500).required().messages({
      'string.min': 'Hospital address must be at least 5 characters',
      'string.max': 'Hospital address cannot exceed 500 characters',
      'any.required': 'Hospital address is required'
    }),
    requiredBy: Joi.date().min('now').required().messages({
      'date.min': 'Required date must be in the future',
      'any.required': 'Required by date is required'
    }),
    medicalNotes: Joi.string().max(1000).optional().messages({
      'string.max': 'Medical notes cannot exceed 1000 characters'
    }),
    contactPerson: Joi.string().max(100).optional().messages({
      'string.max': 'Contact person name cannot exceed 100 characters'
    }),
    contactPhone: Joi.string().pattern(config.PHONE_PATTERN).optional().messages({
      'string.pattern.base': 'Please provide a valid contact phone number'
    })
  }),

  // Ambulance
  ambulance: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Ambulance name must be at least 2 characters',
      'string.max': 'Ambulance name cannot exceed 100 characters',
      'any.required': 'Ambulance name is required'
    }),
    phone: Joi.string().pattern(config.PHONE_PATTERN).required().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number',
      'any.required': 'Phone number is required'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email'
    }),
    address: Joi.string().min(5).max(500).required().messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 500 characters',
      'any.required': 'Address is required'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required().messages({
      'any.only': 'Invalid district',
      'any.required': 'District is required'
    }),
    latitude: Joi.number().min(-90).max(90).optional().messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: Joi.number().min(-180).max(180).optional().messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
    serviceType: Joi.string().valid('BASIC', 'ADVANCED', 'ICU', 'NEONATAL').required().messages({
      'any.only': 'Invalid service type',
      'any.required': 'Service type is required'
    }),
    availability: Joi.string().valid('AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE').default('AVAILABLE').messages({
      'any.only': 'Invalid availability status'
    }),
    responseTime: Joi.number().integer().min(5).max(120).optional().messages({
      'number.min': 'Response time must be at least 5 minutes',
      'number.max': 'Response time cannot exceed 120 minutes'
    }),
    equipment: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Equipment must be an array'
    }),
    operatingHours: Joi.string().max(100).optional().messages({
      'string.max': 'Operating hours cannot exceed 100 characters'
    })
  }),

  // Ambulance update
  ambulanceUpdate: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Ambulance name must be at least 2 characters',
      'string.max': 'Ambulance name cannot exceed 100 characters'
    }),
    phone: Joi.string().pattern(config.PHONE_PATTERN).optional().messages({
      'string.pattern.base': 'Please provide a valid Nepal phone number'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid email'
    }),
    address: Joi.string().min(5).max(500).optional().messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 500 characters'
    }),
    availability: Joi.string().valid('AVAILABLE', 'BUSY', 'MAINTENANCE', 'OFFLINE').optional().messages({
      'any.only': 'Invalid availability status'
    }),
    serviceType: Joi.string().valid('BASIC', 'ADVANCED', 'ICU', 'NEONATAL').optional().messages({
      'any.only': 'Invalid service type'
    }),
    responseTime: Joi.number().integer().min(5).max(120).optional().messages({
      'number.min': 'Response time must be at least 5 minutes',
      'number.max': 'Response time cannot exceed 120 minutes'
    }),
    equipment: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Equipment must be an array'
    }),
    operatingHours: Joi.string().max(100).optional().messages({
      'string.max': 'Operating hours cannot exceed 100 characters'
    })
  }),

  // Eligibility check
  eligibility: Joi.object({
    age: Joi.number().integer().min(18).max(65).required().messages({
      'number.min': 'Minimum age for donation is 18 years',
      'number.max': 'Maximum age for donation is 65 years',
      'any.required': 'Age is required'
    }),
    lastDonation: Joi.date().optional().messages({
      'date.base': 'Please provide a valid date'
    }),
    medicalConditions: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Medical conditions must be an array'
    })
  }),

  // Status
  status: Joi.string().valid('PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED').optional().messages({
    'any.only': 'Invalid status'
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'Error',
        message: 'Validation failed',
        errors
      });
    }

    req[source] = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};
