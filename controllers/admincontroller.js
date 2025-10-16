const db = require('../config/db');
const { logActivity } = require('../services/activityLogService'); 

module.exports = {
  createWard: async (req, res) => {
    const userId = req.user ? req.user.id : 1; 
    const { name, capacity } = req.body;
    let connection; // Declare variable to hold the transaction connection

    // Basic input validation
    if (!name || !capacity || typeof capacity !== 'number' || capacity < 1) {
        return res.status(400).json({ success: false, error: 'Ward name and a valid capacity (1 or more) are required.' });
    }

    try {
        // 1. GET DEDICATED CONNECTION and START TRANSACTION
        connection = await db.getConnection(); 
        await connection.beginTransaction(); 

        // 2. INSERT WARD
        const [wardResult] = await connection.query(
            'INSERT INTO wards (name, capacity) VALUES (?, ?)',
            [name, capacity]
        );
        const wardId = wardResult.insertId;

        // 3. INSERT BEDS
        const bedPromises = [];
        for (let i = 1; i <= capacity; i++) {
            bedPromises.push(
                connection.query(
                    'INSERT INTO beds (ward_id, bed_number, status) VALUES (?, ?, ?)',
                    [wardId, `${name}-${i}`, 'available']
                )
            );
        }
        await Promise.all(bedPromises);

        // 4. LOG ACTIVITY
        await logActivity(
            userId, 
            `Created new ward: ${name} (Capacity: ${capacity})`, 
            'Ward Management'
        );
        
        // 5. COMMIT TRANSACTION and RELEASE connection
        await connection.commit(); 
        connection.release();

        res.status(201).json({ success: true, wardId, message: 'Ward and beds created successfully' });
        
    } catch (err) {
        // 6. ROLLBACK AND RELEASE CONNECTION on failure
        if (connection) {
            await connection.rollback();
            connection.release(); 
        }
        
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

  getActivityLogs: async (req, res) => {
    const userId = req.params.id;
    
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
      
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
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