// ── Payment Model (Simulated - No real payment gateway) ────────
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    transactionId: { type: String, unique: true }, // e.g. "TXN-XXXXXXXX"
    amount:        { type: Number, required: true },
    currency:      { type: String, default: 'GBP' },
    method: {
      type: String,
      enum: ['card', 'wallet', 'bank_transfer'],
      default: 'card',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    // Dummy card details (last 4 digits only - never store real card numbers!)
    cardLastFour: { type: String },
    cardType:     { type: String }, // "visa", "mastercard"
    // Simulated response from dummy payment processor
    gatewayResponse: { type: String },
    failureReason:   { type: String },
  },
  { timestamps: true }
);

// Auto-generate transaction ID
paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.transactionId = `TXN-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
