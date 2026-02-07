const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
  respondToBloodRequest,
  getBloodRequestsByBloodGroup,
  getBloodRequestStats
} = require('../controllers/bloodRequestController');

// Public endpoints
router.get('/', getBloodRequests);
router.get('/search', getBloodRequestsByBloodGroup);
router.get('/stats', getBloodRequestStats);

// Protected endpoints
router.post('/', auth, createBloodRequest);
router.get('/:id', auth, getBloodRequestById);
router.put('/:id/status', auth, updateBloodRequestStatus);
router.post('/:id/respond', auth, respondToBloodRequest);

module.exports = router;
