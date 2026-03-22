// ── Auth Controller ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Reward = require('../models/Reward');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'umms_secret', { expiresIn: '30d' });

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({ name, email, password, phone, city });

    // Auto-create reward account for new user with 50 welcome points
    await Reward.create({
      user: user._id,
      totalPoints: 50,
      lifetimePoints: 50,
      transactions: [{
        type: 'bonus',
        points: 50,
        description: 'Welcome bonus - join UMMS!',
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get current logged-in user profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
};

module.exports = { register, login, getMe };
