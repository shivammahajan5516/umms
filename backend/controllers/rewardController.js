// ── Reward Controller ─────────────────────────────────────────
const Reward = require('../models/Reward');

// @desc  Get current user's reward account
// @route GET /api/rewards
// @access Private
const getMyRewards = async (req, res) => {
  try {
    let reward = await Reward.findOne({ user: req.user._id });
    if (!reward) {
      reward = await Reward.create({ user: req.user._id, totalPoints: 50, lifetimePoints: 50 });
    }
    res.json({ success: true, reward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Check if user has enough points for redemption
// @route POST /api/rewards/check
// @access Private
const checkPoints = async (req, res) => {
  try {
    const { pointsToUse } = req.body;
    const reward = await Reward.findOne({ user: req.user._id });
    const balance = reward?.totalPoints || 0;
    const discountValue = Math.round((pointsToUse / 10) * 0.1 * 100) / 100;

    res.json({
      success: true,
      available: balance >= pointsToUse,
      currentBalance: balance,
      discountValue,
      remainingAfter: balance - pointsToUse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyRewards, checkPoints };
