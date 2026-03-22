// ── Reward Model ──────────────────────────────────────────────
const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'bonus'],
    required: true,
  },
  points:      { type: Number, required: true },
  description: { type: String },
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  createdAt:   { type: Date, default: Date.now },
});

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints:    { type: Number, default: 0 }, // current balance
    lifetimePoints: { type: Number, default: 0 }, // all-time earned
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    transactions: [rewardTransactionSchema],
  },
  { timestamps: true }
);

// Update tier based on lifetime points
rewardSchema.methods.updateTier = function () {
  if (this.lifetimePoints >= 5000)      this.tier = 'platinum';
  else if (this.lifetimePoints >= 2000) this.tier = 'gold';
  else if (this.lifetimePoints >= 500)  this.tier = 'silver';
  else                                  this.tier = 'bronze';
};

module.exports = mongoose.model('Reward', rewardSchema);
