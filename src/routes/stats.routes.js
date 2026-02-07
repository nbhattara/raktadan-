const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getDonationStats,
  getHospitalStats,
  getAmbulanceStats,
  getEmergencyStats
} = require('../controllers/statsController');

// Public endpoints
router.get('/', auth, getDashboardStats);

// Protected endpoints
router.get('/donations', auth, getDonationStats);
router.get('/hospitals', auth, getHospitalStats);
router.get('/ambulances', auth, getAmbulanceStats);
router.get('/emergency', auth, getEmergencyStats);

module.exports = router;
