const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

// ✅ CORS should be the very first middleware after creating app
app.use(cors({
  origin: 'http://localhost:3000', // Match your frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/receptionist', require('./routes/receptionistRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/beds', require('./routes/bedRoutes'));
app.use('/api/wards', require('./routes/wardRoutes'));
app.use('/api/registration', require('./routes/registrationRoute'));

// Basic route
app.get('/', (req, res) => {
  res.send('Hospital Bed System Backend is Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
