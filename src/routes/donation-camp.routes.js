const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createDonationCamp,
  getDonationCamps,
  getDonationCampById,
  updateDonationCamp,
  deleteDonationCamp,
  getUpcomingCamps,
  getCampStats
} = require('../controllers/donationCampController');

// Public endpoints
router.get('/', getDonationCamps);
router.get('/upcoming', getUpcomingCamps);
router.get('/stats', getCampStats);

// Protected endpoints
router.post('/', auth, authorize('ADMIN'), createDonationCamp);
router.get('/:id', auth, getDonationCampById);
router.put('/:id', auth, authorize('ADMIN'), updateDonationCamp);
router.delete('/:id', auth, authorize('ADMIN'), deleteDonationCamp);

module.exports = router;
