const db = require('../config/db');
const { logActivity } = require('../services/activityLogService'); 

module.exports = {
  createWard: async (req, res) => {
    const userId = req.user ? req.user.id : 1; 
    const { name, capacity } = req.body;

    try {
      await db.query('START TRANSACTION');
      const [wardResult] = await db.query(
        'INSERT INTO wards (name, capacity) VALUES (?, ?)',
        [name, capacity]
      );
      const wardId = wardResult.insertId;

      const bedPromises = [];
      for (let i = 1; i <= capacity; i++) {
        bedPromises.push(
          db.query(
            'INSERT INTO beds (ward_id, bed_number, status) VALUES (?, ?, ?)',
            [wardId, `${name}-${i}`, 'available']
          )
        );
      }
      await Promise.all(bedPromises);

      await logActivity(
        userId, 
        `Created new ward: ${name} (Capacity: ${capacity})`, 
        'Ward Management'
      );

      res.status(201).json({ success: true, wardId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to create ward and beds' });
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.params.id;
    const adminId = req.user ? req.user.id : 1; 

    try {
      const [users] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
      const usernameToDelete = users.length > 0 ? users[0].username : `ID: ${userId}`;
      
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await logActivity(
        adminId, 
        `Deleted user: ${usernameToDelete}`, 
        'User Management'
      );
      
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  },

  // Updated: Get activity logs for a specific user by ID
 // In your admincontroller.js
getActivityLogs: async (req, res) => {
    const userId = req.params.id;
    console.log('Backend: Fetching logs for user ID:', userId);
    
    try {
      const [logs] = await db.query(`
        SELECT 
          a.id,
          u.username AS user,
          a.action,
          a.location,
          a.timestamp
        FROM activity_logs a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
        ORDER BY a.timestamp DESC
        LIMIT 50
      `, [userId]);
      
      console.log('Backend: Found', logs.length, 'logs');
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error('Backend Error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query('SELECT id, username, role FROM users');
      res.json({ success: true, data: users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  }
};