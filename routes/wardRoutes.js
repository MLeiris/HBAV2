const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const wardController = require('../controllers/wardcontroller');

// Ward statistics
router.get('/stats', authenticateToken, wardController.getWardStats);
//get all wards
router.get('/', authenticateToken, wardController.getAllWards);

module.exports = router;