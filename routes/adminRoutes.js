const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/admincontroller');

router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Ward management
router.post('/wards', authenticateToken, authorizeRoles('admin'), adminController.createWard);

// User management
router.get('/users', authenticateToken, authorizeRoles('admin'), adminController.getAllUsers);
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteUser);

router.get('/Test_Route_A1b2/users/:id', authenticateToken, authorizeRoles('admin'), adminController.getActivityLogs);

module.exports = router;