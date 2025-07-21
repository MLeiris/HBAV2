const db = require('../config/db');

module.exports = {
  registerPatient: async (patientData) => {
    const [result] = await db.query(
      'INSERT INTO patients (name, age, gender, medical_condition, bed_id) VALUES (?, ?, ?, ?, ?)',
      [patientData.name, patientData.age, patientData.gender, patientData.medical_condition, patientData.bedId]
    );
    return result.insertId;
  },

  dischargePatient: async (patientId) => {
    await db.query(`
      UPDATE patients 
      SET discharged = TRUE, discharge_date = NOW() 
      WHERE id = ?
    `, [patientId]);
  },

  getActivePatients: async () => {
    const [results] = await db.query(`
      SELECT p.*, b.bed_number, w.name AS ward_name 
      FROM patients p
      LEFT JOIN beds b ON p.bed_id = b.id
      LEFT JOIN wards w ON b.ward_id = w.id
      WHERE p.discharged = FALSE
    `);
    return results;
  },

  searchPatients: async (name) => {
    const [results] = await db.query(
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
    return results;
  },

  getPatientHistory: async (name, startDate, endDate) => {
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

    if (startDate) {
      query += ` AND ph.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND ph.created_at <= ?`;
      params.push(endDate + ' 23:59:59');
    }

    query += ` ORDER BY ph.created_at DESC LIMIT 100`;

    const [results] = await db.query(query, params);
    return results;
  }
};