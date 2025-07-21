const db = require('../config/db');

module.exports = {
  createBedsForWard: async (wardId, wardName, capacity) => {
    const bedPromises = [];
    for (let i = 1; i <= capacity; i++) {
      bedPromises.push(
        db.query(
          'INSERT INTO beds (ward_id, bed_number, status) VALUES (?, ?, ?)',
          [wardId, `${wardName}-${i}`, 'available']
        )
      );
    }
    await Promise.all(bedPromises);
  },

  getAllBeds: async () => {
    const [results] = await db.query(`
      SELECT b.*, w.name AS ward_name 
      FROM beds b
      LEFT JOIN wards w ON b.ward_id = w.id
    `);
    return results;
  },

  getAvailableBeds: async () => {
    const [results] = await db.query(`
      SELECT b.*, w.name AS ward_name 
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      WHERE b.status = "available"
    `);
    return results;
  },

  updateBedStatus: async (bedId, status) => {
    await db.query('UPDATE beds SET status = ? WHERE id = ?', [status, bedId]);
  }
};