const db = require('../config/db');

module.exports = {
  getAllBeds: async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT b.*, w.name AS ward_name 
        FROM beds b
        LEFT JOIN wards w ON b.ward_id = w.id
      `);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  },

  getAvailableBeds: async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT b.*, w.name AS ward_name 
        FROM beds b
        JOIN wards w ON b.ward_id = w.id
        WHERE b.status = "available"
      `);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  }
};