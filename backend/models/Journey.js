// ── Journey Model ─────────────────────────────────────────────
// Represents a multi-modal journey with one or more transport segments
const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['bus', 'metro', 'bike', 'scooter', 'ride-hail', 'walk'],
    required: true,
  },
  from: { type: String, required: true },
  to:   { type: String, required: true },
  departureTime: { type: String },  // e.g. "09:15"
  arrivalTime:   { type: String },  // e.g. "10:30"
  duration:      { type: Number },  // minutes
  distance:      { type: Number },  // km
  fare:          { type: Number, default: 0 },
  provider:      { type: String },  // e.g. "TfL", "Northern Rail"
  co2Saved:      { type: Number, default: 0 }, // grams CO2 saved vs car
});

const journeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    origin:      { type: String, required: true },
    destination: { type: String, required: true },
    date:        { type: String, required: true }, // "YYYY-MM-DD"
    segments:    [segmentSchema],
    totalFare:   { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // minutes
    totalDistance: { type: Number, default: 0 }, // km
    totalCo2Saved: { type: Number, default: 0 },
    ecoPoints:   { type: Number, default: 0 },   // points to earn
    status: {
      type: String,
      enum: ['planned', 'booked', 'completed', 'cancelled'],
      default: 'planned',
    },
    transportModes: [String], // summary of modes used
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journey', journeySchema);
