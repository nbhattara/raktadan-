const Joi = require('joi');
const config = require('../config');

// Common validation schemas
const schemas = {
  // User validation
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
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
    address: Joi.string().required().messages({
      'string.empty': 'Address is required'
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required'
    }),
    state: Joi.string().required().messages({
      'string.empty': 'State is required'
    }),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required().messages({
      'any.only': 'Invalid district',
      'any.required': 'District is required'
    }),
    pincode: Joi.string().pattern(config.PINCODE_PATTERN).required().messages({
      'string.pattern.base': 'Please provide a valid 6-digit pincode',
      'any.required': 'Pincode is required'
    }),
    emergencyContact: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Emergency contact name is required'
      }),
      phone: Joi.string().pattern(config.PHONE_PATTERN).required().messages({
        'string.pattern.base': 'Please provide a valid emergency contact phone number',
        'any.required': 'Emergency contact phone is required'
      }),
      relation: Joi.string().required().messages({
        'string.empty': 'Relation is required'
      })
    }).required()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  }),

  // Blood request validation
  bloodRequest: Joi.object({
    patientName: Joi.string().min(2).max(50).required(),
    patientAge: Joi.number().integer().min(0).max(120).required(),
    patientGender: Joi.string().valid(...config.GENDERS).required(),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required(),
    unitsRequired: Joi.number().integer().min(1).max(20).required(),
    urgency: Joi.string().valid(...config.URGENCY_LEVELS).default('MEDIUM'),
    hospitalName: Joi.string().min(2).max(100).required(),
    hospitalAddress: Joi.string().required(),
    hospitalCity: Joi.string().required(),
    hospitalState: Joi.string().required(),
    hospitalPincode: Joi.string().pattern(config.PINCODE_PATTERN).required(),
    hospitalPhone: Joi.string().pattern(config.PHONE_PATTERN).required(),
    doctorName: Joi.string().min(2).max(50).required(),
    doctorPhone: Joi.string().pattern(config.PHONE_PATTERN).required(),
    medicalReason: Joi.string().min(10).max(500).required(),
    requiredBy: Joi.date().iso().greater('now').required().messages({
      'date.greater': 'Required by date must be in the future'
    }),
    contactPerson: Joi.string().min(2).max(50).required(),
    contactPersonPhone: Joi.string().pattern(config.PHONE_PATTERN).required(),
    additionalNotes: Joi.string().max(1000).optional()
  }),

  // Ambulance service validation
  ambulanceService: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phoneNumber: Joi.string().pattern(config.PHONE_PATTERN).required(),
    alternatePhoneNumber: Joi.string().pattern(config.PHONE_PATTERN).optional(),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required(),
    city: Joi.string().required(),
    serviceArea: Joi.array().items(Joi.string().max(100)).required(),
    is24Hours: Joi.boolean().default(false),
    serviceType: Joi.string().valid(...config.SERVICE_TYPES).default('PRIVATE'),
    vehicleType: Joi.string().valid(...config.VEHICLE_TYPES).default('BASIC'),
    facilities: Joi.array().items(Joi.string().max(50)).required(),
    averageResponseTime: Joi.number().integer().min(5).max(120).optional(),
    serviceCharges: Joi.object({
      baseFare: Joi.number().min(0).required(),
      perKmRate: Joi.number().min(0).required(),
      nightCharge: Joi.number().min(0).optional()
    }).required(),
    operatingHours: Joi.object({
      from: Joi.string().pattern(config.TIME_PATTERN).required(),
      to: Joi.string().pattern(config.TIME_PATTERN).required(),
      days: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).required()
    }).required(),
    specialServices: Joi.array().items(Joi.string().max(100)).required(),
    contactPerson: Joi.string().min(2).max(50).required(),
    contactPersonPhone: Joi.string().pattern(config.PHONE_PATTERN).required(),
    notes: Joi.string().max(500).optional()
  }),

  // Donation record validation
  donationRecord: Joi.object({
    donationType: Joi.string().valid(...config.DONATION_TYPES).default('WHOLE_BLOOD'),
    location: Joi.string().required(),
    organization: Joi.string().max(100).optional(),
    units: Joi.number().integer().min(1).max(5).default(1),
    notes: Joi.string().max(500).optional()
  }),

  // Common query validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  district: Joi.object({
    district: Joi.string().valid(...config.NEPAL_DISTRICTS).required()
  }),

  bloodGroup: Joi.object({
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS).required()
  }),

  // User management schemas
  toggleRole: Joi.object({
    newRole: Joi.string().valid('DONOR', 'RECIPIENT').required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS),
    age: Joi.number().integer().min(18).max(65),
    gender: Joi.string().valid(...config.GENDERS),
    address: Joi.string().max(500),
    city: Joi.string().max(100),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    isAvailable: Joi.boolean(),
    medicalConditions: Joi.array().items(Joi.string()),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relationship: Joi.string()
    }),
    hospitalName: Joi.string().max(200),
    department: Joi.string().max(100),
    staffId: Joi.string().max(50),
    workShift: Joi.object({
      from: Joi.string().required(),
      to: Joi.string().required(),
      days: Joi.array().items(Joi.string()).required()
    })
  }),

  userRegistration: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    role: Joi.string().valid(...config.USER_ROLES).default('DONOR'),
    bloodGroup: Joi.string().valid(...config.BLOOD_GROUPS),
    age: Joi.number().integer().min(18).max(65),
    gender: Joi.string().valid(...config.GENDERS),
    address: Joi.string().max(500),
    city: Joi.string().max(100),
    district: Joi.string().valid(...config.NEPAL_DISTRICTS),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    hospitalName: Joi.string().max(200),
    department: Joi.string().max(100),
    staffId: Joi.string().max(50)
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
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
