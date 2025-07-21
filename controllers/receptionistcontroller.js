const db = require('../config/db');

module.exports = {
  registerPatient: async (req, res) => {
    const { name, age, gender, medical_condition, ward_name } = req.body;

    try {
      await db.query('START TRANSACTION');

      const [availableBed] = await db.query(`
        SELECT b.id 
        FROM beds b
        JOIN wards w ON b.ward_id = w.id
        WHERE w.name = ? AND b.status = 'available'
        LIMIT 1
      `, [ward_name]);

      if (!availableBed.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'No available beds in this ward' });
      }

      const bedId = availableBed[0].id;

      const [patient] = await db.query(
        'INSERT INTO patients (name, age, gender, medical_condition, bed_id) VALUES (?, ?, ?, ?, ?)',
        [name, age, gender, medical_condition, bedId]
      );

      await db.query('UPDATE beds SET status = "occupied" WHERE id = ?', [bedId]);

      await db.query('COMMIT');
      res.status(201).json({ 
        patientId: patient.insertId,
        assignedBedId: bedId,
        message: 'Patient registered successfully and bed assigned'
      });
    } catch (err) {
      await db.query('ROLLBACK');
      res.status(500).json({ error: 'Patient registration failed' });
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
  }
};