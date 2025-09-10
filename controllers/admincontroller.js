const db = require('../config/db');
const wardService = require('../services/wardService');
const bedService = require('../services/bedService');

module.exports = {
  createWard: async (req, res) => {
    const { name, capacity } = req.body;
    
    try {
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

      res.status(201).json({ wardId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create ward and beds' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query('SELECT id, username, role FROM users');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.params.id;
    try {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};