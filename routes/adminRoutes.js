const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/admincontroller');

// Ward management
router.post('/wards', authenticateToken, authorizeRoles('admin'), adminController.createWard);

// User management
router.get('/users', authenticateToken, authorizeRoles('admin'), adminController.getAllUsers);

module.exports = router;