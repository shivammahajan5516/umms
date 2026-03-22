// ── Booking Controller ────────────────────────────────────────
const Booking = require('../models/Booking');
const Journey = require('../models/Journey');

// @desc  Create a booking from a journey
// @route POST /api/bookings
// @access Private
const createBooking = async (req, res) => {
  try {
    const { journeyId, rewardPointsUsed = 0, passengers = 1 } = req.body;

    const journey = await Journey.findById(journeyId);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });

    const totalFare = journey.totalFare * passengers;
    // Each 10 reward points = £0.10 discount
    const discountAmount = Math.round((rewardPointsUsed / 10) * 0.1 * 100) / 100;
    const finalFare = Math.max(0, Math.round((totalFare - discountAmount) * 100) / 100);

    const booking = await Booking.create({
      user: req.user._id,
      journey: journeyId,
      totalFare,
      discountAmount,
      finalFare,
      rewardPointsUsed,
      passengers,
      status: 'pending',
    });

    // Update journey status
    journey.status = 'booked';
    await journey.save();

    const populated = await Booking.findById(booking._id).populate('journey');
    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all bookings for current user
// @route GET /api/bookings
// @access Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('journey')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
// @access Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('journey');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Confirm booking (after payment)
// @route PATCH /api/bookings/:id/confirm
// @access Private
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'confirmed';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Cancel booking
// @route PATCH /api/bookings/:id/cancel
// @access Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, confirmBooking, cancelBooking };
