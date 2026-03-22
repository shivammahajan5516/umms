// bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, confirmBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/confirm', protect, confirmBooking);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
