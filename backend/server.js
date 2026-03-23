// ============================================================
// UMMS - Smart Urban Mobility Management System
// Main Server Entry Point
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://umms-frontend.vercel.app'   // ← add your Vercel URL after deploy
  ],
  credentials: true
}));
app.use(express.json());

// ── Database Connection ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umms')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/journeys', require('./routes/journeyRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/rewards',  require('./routes/rewardRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UMMS API is running', timestamp: new Date() });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 UMMS Server running on port ${PORT}`);
});
