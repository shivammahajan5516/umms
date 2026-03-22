// ── Admin Analytics Controller ────────────────────────────────
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Journey = require('../models/Journey');

// @desc  Get admin dashboard analytics
// @route GET /api/admin/analytics
// @access Private + Admin
const getAnalytics = async (req, res) => {
  try {
    // ── Counts ──────────────────────────────────────────────
    const totalUsers    = await User.countDocuments({ role: 'passenger' });
    const totalBookings = await Booking.countDocuments();
    const totalJourneys = await Journey.countDocuments();

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // ── Revenue ─────────────────────────────────────────────
    const revenueData = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // ── Bookings over last 7 days ────────────────────────────
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd   = new Date(d.setHours(23, 59, 59, 999));
      const count = await Booking.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } });
      last7Days.push({
        date: dayStart.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        count,
      });
    }

    // ── Transport mode distribution ──────────────────────────
    const modeData = await Journey.aggregate([
      { $unwind: '$transportModes' },
      { $group: { _id: '$transportModes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── Recent bookings ──────────────────────────────────────
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('journey', 'origin destination')
      .sort({ createdAt: -1 })
      .limit(10);

    // ── New users per day (last 7 days) ──────────────────────
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd   = new Date(d.setHours(23, 59, 59, 999));
      const count = await User.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } });
      userGrowth.push({
        date: dayStart.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        count,
      });
    }

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalBookings,
        totalJourneys,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bookingsByStatus,
        last7Days,
        modeData,
        recentBookings,
        userGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
// @access Private + Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics, getAllUsers };
