// ── User Controller ───────────────────────────────────────────
const User = require('../models/User');

// @desc  Get user profile
// @route GET /api/users/profile
// @access Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update user profile
// @route PUT /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const user = await User.findById(req.user._id);

    if (name)  user.name  = name;
    if (phone) user.phone = phone;
    if (city)  user.city  = city;

    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
