const db = require('../config/db');

module.exports = {
  getActivePatients: async (req, res) => {
    try {
      const [patients] = await db.query(`
        SELECT p.*, b.bed_number, w.name AS ward_name 
        FROM patients p
        LEFT JOIN beds b ON p.bed_id = b.id
        LEFT JOIN wards w ON b.ward_id = w.id
        WHERE p.discharged = FALSE
      `);
      res.json(patients);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  },

  getPatientHistory: async (req, res) => {
    try {
      const { name, start_date, end_date } = req.query;

      if (!name) {
        return res.status(400).json({ error: 'Patient name is required' });
      }

      let query = `
        SELECT 
          p.id AS patient_id,
          p.name AS patient_name,
          ph.action,
          w.name AS ward,
          b.bed_number AS bed,
          ph.medical_condition,
          DATE_FORMAT(ph.created_at, '%Y-%m-%d %H:%i:%s') AS date
        FROM patient_history ph
        JOIN patients p ON ph.patient_id = p.id
        LEFT JOIN beds b ON ph.bed_id = b.id
        LEFT JOIN wards w ON ph.ward_id = w.id
        WHERE p.name LIKE ?
      `;

      const params = [`%${name}%`];

      if (start_date) {
        query += ` AND ph.created_at >= ?`;
        params.push(start_date);
      }
      if (end_date) {
        query += ` AND ph.created_at <= ?`;
        params.push(end_date + ' 23:59:59');
      }

      query += ` ORDER BY ph.created_at DESC LIMIT 100`;

      const [history] = await db.query(query, params);

      if (history.length === 0) {
        return res.status(404).json({ 
          error: 'No history found for patients matching this name',
          searchQuery: name
        });
      }

      res.json({
        count: history.length,
        patients: [...new Set(history.map(item => item.patient_name))],
        history,
        message: `Found ${history.length} records across ${[...new Set(history.map(item => item.patient_name))].length} patients`
      });
    } catch (err) {
      console.error('Patient history search error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  }
};