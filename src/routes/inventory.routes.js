const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  getInventorySummary,
  getInventoryByDistrict,
  getCriticalShortages,
  getDonationTrends,
  updateInventory
} = require('../controllers/inventoryController');

const router = express.Router();

// Public endpoints
router.get('/', getInventorySummary);
router.get('/summary', getInventorySummary);

router.get('/district', async (req, res, next) => {
  try {
    const result = await getInventoryByDistrict(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

router.get('/critical', getCriticalShortages);

router.get('/trends', async (req, res, next) => {
  try {
    const result = await getDonationTrends(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

// Admin only endpoints
router.put('/', auth, authorize('ADMIN'), async (req, res, next) => {
  try {
    const result = await updateInventory(req, res, next);
    return result;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
