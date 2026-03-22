// ── Payment Controller ────────────────────────────────────────
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Reward = require('../models/Reward');
const { processPayment } = require('../services/paymentService');

// @desc  Process a payment for a booking
// @route POST /api/payments
// @access Private
const makePayment = async (req, res) => {
  try {
    const { bookingId, cardNumber, expiryDate, cvv, cardholderName } = req.body;

    const booking = await Booking.findById(bookingId).populate('journey');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Call dummy payment processor
    const result = await processPayment({
      amount: booking.finalFare,
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
    });

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount: booking.finalFare,
      status: result.status,
      method: 'card',
      cardLastFour: result.cardLastFour,
      cardType: result.cardType,
      gatewayResponse: result.gatewayResponse,
      failureReason: result.failureReason,
    });

    if (result.success) {
      // ── On success: confirm booking, award eco-points ──────
      booking.status = 'confirmed';
      await booking.save();

      // Award eco-points from the journey
      const journey = booking.journey;
      const pointsToAward = journey?.ecoPoints || 5;

      let reward = await Reward.findOne({ user: req.user._id });
      if (!reward) {
        reward = await Reward.create({ user: req.user._id });
      }

      // Deduct used reward points (if any)
      if (booking.rewardPointsUsed > 0) {
        reward.totalPoints = Math.max(0, reward.totalPoints - booking.rewardPointsUsed);
        reward.transactions.push({
          type: 'redeemed',
          points: -booking.rewardPointsUsed,
          description: `Points redeemed for booking ${booking.bookingRef}`,
          booking: booking._id,
        });
      }

      // Add earned eco-points
      reward.totalPoints += pointsToAward;
      reward.lifetimePoints += pointsToAward;
      reward.transactions.push({
        type: 'earned',
        points: pointsToAward,
        description: `Eco-points earned: ${journey.origin} → ${journey.destination}`,
        booking: booking._id,
      });
      reward.updateTier();
      await reward.save();

      res.json({
        success: true,
        payment,
        message: `Payment successful! You earned ${pointsToAward} eco-points.`,
        ecoPointsEarned: pointsToAward,
        newPointsBalance: reward.totalPoints,
      });
    } else {
      // ── On failure: leave booking as pending ───────────────
      res.status(402).json({
        success: false,
        payment,
        message: result.failureReason || 'Payment failed',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get payment history for user
// @route GET /api/payments
// @access Private
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({ path: 'booking', populate: { path: 'journey' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { makePayment, getMyPayments };
