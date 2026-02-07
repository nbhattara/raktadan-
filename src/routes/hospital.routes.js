const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const {
  getHospitals,
  getHospitalById,
  searchHospitals,
  getHospitalsByDistrict
} = require('../controllers/hospitalControllerNew');

const router = express.Router();

// Public endpoints
router.get('/', auth, getHospitals);
router.get('/search', auth, searchHospitals);
router.get('/district/:district', auth, getHospitalsByDistrict);
router.get('/:id', auth, getHospitalById);

module.exports = router;
