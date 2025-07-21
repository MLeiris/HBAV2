const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Create connection pool for better performance and automatic reconnection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('db.js loaded...');

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.log('Database connection failed:');
    console.log(err);
  }
})();

module.exports = pool;