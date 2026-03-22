// ── Booking Model ─────────────────────────────────────────────
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    journey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journey',
      required: true,
    },
    bookingRef: { type: String, unique: true }, // e.g. "UMMS-20240101-XXXX"
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    totalFare:      { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalFare:      { type: Number, required: true },
    rewardPointsUsed: { type: Number, default: 0 },
    passengers:     { type: Number, default: 1 },
    notes:          { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate booking reference before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingRef = `UMMS-${date}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
