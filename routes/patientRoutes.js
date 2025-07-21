const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const patientController = require('../controllers/patientcontroller');

// Patient search
router.get('/search', authenticateToken, authorizeRoles('doctor', 'receptionist'), patientController.searchPatients);

module.exports = router;