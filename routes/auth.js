const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
        
        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId 
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Debug: Log login attempt
    console.log('Login attempt for:', username);
    
    // 1. Find user
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('Found user:', users[0]);

    // 2. Verify user exists
    if (!users.length) {
      console.log('User not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // 3. Verify password
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);

    if (!match) {
      console.log('Password mismatch');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Send response
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;