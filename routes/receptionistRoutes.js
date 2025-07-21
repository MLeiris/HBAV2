const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const receptionistController = require('../controllers/receptionistcontroller');

// Patient management
router.post('/patients', authenticateToken, authorizeRoles('receptionist'), receptionistController.registerPatient);
router.put('/patients/:id/discharge', authenticateToken, authorizeRoles('receptionist'), receptionistController.dischargePatient);

module.exports = router;