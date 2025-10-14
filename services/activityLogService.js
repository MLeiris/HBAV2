
const db = require('../config/db');

const logActivity = async (userId, action, location) => {
    try {
        await db.query(
            'INSERT INTO activity_logs (user_id, action, location) VALUES (?, ?, ?)',
            [userId, action, location]
        );
    } catch (error) {

        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };