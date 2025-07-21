const db = require('../config/db');

module.exports = {
  searchPatients: async (req, res) => {
    try {
      const { name } = req.query;

      const [patients] = await db.query(
        `SELECT 
          id, 
          name, 
          age, 
          gender, 
          admission_date,
          discharged
        FROM patients
        WHERE name LIKE ? 
        LIMIT 50`,
        [`%${name}%`]
      );

      res.json({
        success: true,
        count: patients.length,
        data: patients
      });
    } catch (err) {
      console.error('Simple search error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Search failed',
        details: err.message 
      });
    }
  }
};