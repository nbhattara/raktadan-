const dotenv = require('dotenv');

dotenv.config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB) || 0,
  
  // File Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
  
  // Nepal-specific
  DEFAULT_COUNTRY_CODE: process.env.DEFAULT_COUNTRY_CODE || '+977',
  OTP_EXPIRE_MINUTES: parseInt(process.env.OTP_EXPIRE_MINUTES) || 5,
  MIN_DONATION_INTERVAL_DAYS: parseInt(process.env.MIN_DONATION_INTERVAL_DAYS) || 90,
  EMERGENCY_CONTACT_NUMBER: process.env.EMERGENCY_CONTACT_NUMBER || '1155',
  
  // Constants
  BLOOD_GROUPS: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  GENDERS: ['MALE', 'FEMALE', 'OTHER'],
  USER_ROLES: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF', 'DONOR', 'RECIPIENT'],
  DONATION_TYPES: ['WHOLE_BLOOD', 'PLATELETS', 'PLASMA'],
  REQUEST_STATUSES: ['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
  URGENCY_LEVELS: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  SERVICE_TYPES: ['GOVERNMENT', 'PRIVATE', 'NGO', 'HOSPITAL_BASED'],
  VEHICLE_TYPES: ['BASIC', 'ADVANCED', 'ICU', 'NEONATAL'],
  CAMP_STATUSES: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  
  // Role permissions
  ROLE_PERMISSIONS: {
    SUPER_ADMIN: [
      'manage_all_users',
      'manage_hospitals',
      'manage_blood_banks',
      'manage_system_settings',
      'view_all_data',
      'approve_hospitals',
      'emergency_override'
    ],
    HOSPITAL_ADMIN: [
      'manage_hospital_staff',
      'manage_blood_requests',
      'manage_donation_camps',
      'view_hospital_data',
      'manage_inventory',
      'approve_donor_registrations'
    ],
    BLOOD_BANK_STAFF: [
      'manage_blood_inventory',
      'process_donations',
      'manage_blood_requests',
      'update_blood_availability',
      'generate_reports'
    ],
    DONOR: [
      'manage_profile',
      'donate_blood',
      'view_donation_history',
      'receive_notifications',
      'toggle_recipient_role'
    ],
    RECIPIENT: [
      'manage_profile',
      'request_blood',
      'view_request_history',
      'receive_notifications',
      'toggle_donor_role'
    ]
  },
  
  // Nepal Districts
  NEPAL_DISTRICTS: [
    'Jhapa', 'Ilam', 'Taplejung', 'Panchthar', 'Terhathum', 'Sankhuwasabha', 'Bhojpur', 'Dhankuta',
    'Khotang', 'Solukhumbu', 'Okhaldhunga', 'Udayapur', 'Saptari', 'Siraha', 'Dhanusa', 'Mahottari',
    'Sarlahi', 'Rautahat', 'Bara', 'Parsa', 'Chitwan', 'Makwanpur', 'Ramechhap', 'Sindhuli',
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Rasuwa', 'Sindhupalchok',
    'Dolakha', 'Ramechhap', 'Sindhuli', 'Mahagadhi', 'Baglung', 'Mustang', 'Myagdi', 'Parbat',
    'Kaski', 'Lamjung', 'Gorkha', 'Manang', 'Syangja', 'Tanahu', 'Kapilvastu', 'Rupandehi', 'Nawalparasi',
    'Palpa', 'Arghakhanchi', 'Gulmi', 'Pyuthan', 'Rolpa', 'Rukum', 'Salyan', 'Dang', 'Banke',
    'Bardiya', 'Kailali', 'Kanchanpur', 'Doti', 'Dadeldhura', 'Baitadi', 'Darchula', 'Sudurpaschim'
  ],
  
  // Validation patterns
  PHONE_PATTERN: /^[+]?[9][6-9]\d{8,9}$/,
  EMAIL_PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PINCODE_PATTERN: /^\d{6}$/,
  TIME_PATTERN: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

module.exports = config;
