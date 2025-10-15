const db = require('../config/db');

module.exports = {
  registerPatient: async (req, res) => {
    const { name, age, gender, medical_condition, ward_name } = req.body;

    try {
      await db.query('START TRANSACTION');

      // First, check if the ward exists
      const [ward] = await db.query(`
        SELECT w.id, w.name, w.capacity, 
               COUNT(b.id) as occupied_beds
        FROM wards w
        LEFT JOIN beds b ON w.id = b.ward_id AND b.status = 'occupied'
        WHERE w.name = ?
        GROUP BY w.id
      `, [ward_name]);

      if (!ward.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: `Ward "${ward_name}" not found` });
      }

      const wardData = ward[0];
      const availableBeds = wardData.capacity - parseInt(wardData.occupied_beds);

      // Check if ward has available capacity
      if (availableBeds <= 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Ward "${ward_name}" is completely full! All ${wardData.capacity} beds are occupied. Please choose another ward.` 
        });
      }

      // Find available bed
      const [availableBed] = await db.query(`
        SELECT b.id 
        FROM beds b
        JOIN wards w ON b.ward_id = w.id
        WHERE w.name = ? AND b.status = 'available'
        LIMIT 1
      `, [ward_name]);

      if (!availableBed.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ 
          error: `No available beds in "${ward_name}". This ward has ${availableBeds} bed${availableBeds !== 1 ? 's' : ''} available but they might be undergoing maintenance.` 
        });
      }

      const bedId = availableBed[0].id;

      // Register patient
      const [patient] = await db.query(
        'INSERT INTO patients (name, age, gender, medical_condition, bed_id) VALUES (?, ?, ?, ?, ?)',
        [name, age, gender, medical_condition, bedId]
      );

      // Update bed status
      await db.query('UPDATE beds SET status = "occupied" WHERE id = ?', [bedId]);

      await db.query('COMMIT');
      
      res.status(201).json({ 
        id: patient.insertId,
        name,
        age,
        gender,
        medical_condition,
        ward_name,
        bed_id: bedId,
        message: 'Patient registered successfully and bed assigned'
      });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Patient registration error:', err);
      res.status(500).json({ error: 'Patient registration failed due to server error' });
    }
  },

  dischargePatient: async (req, res) => {
    const patientId = req.params.id;
    try {
      await db.query('START TRANSACTION');
      
      const [patient] = await db.query('SELECT bed_id FROM patients WHERE id = ?', [patientId]);
      if (!patient.length) return res.status(404).json({ error: 'Patient not found' });

      await db.query(`
        UPDATE patients 
        SET discharged = TRUE, discharge_date = NOW() 
        WHERE id = ?
      `, [patientId]);

      await db.query(`
        UPDATE beds 
        SET status = "available" 
        WHERE id = ?
      `, [patient[0].bed_id]);

      await db.query('COMMIT');
      res.json({ message: 'Patient discharged successfully' });
    } catch (err) {
      await db.query('ROLLBACK');
      res.status(500).json({ error: 'Discharge failed' });
    }
  },

  searchPatients: async (req, res) => {
    try {
      const { name } = req.query;

      const [patients] = await db.query(
        `SELECT 
          p.id, 
          p.name, 
          p.age, 
          p.gender, 
          p.admission_date,
          p.discharged,
          p.medical_condition,
          w.name AS ward,
          b.id AS bed,
          b.status AS bed_status
        FROM patients p
        LEFT JOIN beds b ON p.bed_id = b.id
        LEFT JOIN wards w ON b.ward_id = w.id
        WHERE p.name LIKE ? 
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