const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedcontroller');

// Bed information
router.get('/', bedController.getAllBeds);
router.get('/available', bedController.getAvailableBeds);

module.exports = router;