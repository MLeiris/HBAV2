const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Input validation
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 1. Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?', 
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const [result] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    // 4. Generate token (optional)
    const token = jwt.sign(
      { id: result.insertId, username, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username, role }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});


module.exports = router;