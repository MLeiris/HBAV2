const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const patientController = require('../controllers/patientcontroller');
const receptionistController = require('../controllers/receptionistcontroller');

// Patient search
router.get('/search', authenticateToken, authorizeRoles('doctor'), patientController.searchPatients);
// router.get('/receptionist/search', authenticateToken, authorizeRoles('receptionist'), receptionistController.searchPatients);

module.exports = router;