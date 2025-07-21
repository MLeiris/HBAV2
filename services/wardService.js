const db = require('../config/db');

module.exports = {
  createWard: async (name, capacity) => {
    const [wardResult] = await db.query(
      'INSERT INTO wards (name, capacity) VALUES (?, ?)',
      [name, capacity]
    );
    return wardResult.insertId;
  },

  getWardStats: async () => {
    const [results] = await db.query(`
      SELECT 
        w.id, 
        w.name, 
        w.capacity,
        COUNT(b.id) AS total_beds,
        SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_beds,
        SUM(CASE WHEN b.status = 'available' THEN 1 ELSE 0 END) AS available_beds
      FROM wards w
      LEFT JOIN beds b ON w.id = b.ward_id
      GROUP BY w.id
    `);
    return results;
  }
};