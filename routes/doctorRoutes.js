const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const doctorController = require('../controllers/doctorcontroller');

// Patient management
router.get('/patients', authenticateToken, authorizeRoles('doctor'), doctorController.getActivePatients);

// Patient history
router.get('/patients/history', authenticateToken, authorizeRoles('doctor'), doctorController.getPatientHistory);

module.exports = router;