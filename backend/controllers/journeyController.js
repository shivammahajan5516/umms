// ── Journey Controller ────────────────────────────────────────
const Journey = require('../models/Journey');
const { generateJourneyOptions, UK_CITIES } = require('../services/journeyService');

// @desc  Get list of available UK cities
// @route GET /api/journeys/cities
// @access Private
const getCities = (req, res) => {
  res.json({ success: true, cities: UK_CITIES });
};

// @desc  Plan journey options (simulated)
// @route POST /api/journeys/plan
// @access Private
const planJourney = (req, res) => {
  const { origin, destination, date } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ success: false, message: 'Origin, destination, and date are required' });
  }

  if (origin === destination) {
    return res.status(400).json({ success: false, message: 'Origin and destination must be different' });
  }

  const options = generateJourneyOptions(origin, destination, date);
  res.json({ success: true, options });
};

// @desc  Save selected journey to DB
// @route POST /api/journeys
// @access Private
const saveJourney = async (req, res) => {
  try {
    const {
      origin, destination, date,
      segments, totalFare, totalDuration,
      totalDistance, totalCo2Saved, ecoPoints, transportModes,
    } = req.body;

    const journey = await Journey.create({
      user: req.user._id,
      origin, destination, date,
      segments, totalFare, totalDuration,
      totalDistance, totalCo2Saved, ecoPoints, transportModes,
    });

    res.status(201).json({ success: true, journey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all journeys for current user
// @route GET /api/journeys
// @access Private
const getMyJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, journeys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single journey by ID
// @route GET /api/journeys/:id
// @access Private
const getJourneyById = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    if (journey.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    res.json({ success: true, journey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCities, planJourney, saveJourney, getMyJourneys, getJourneyById };
