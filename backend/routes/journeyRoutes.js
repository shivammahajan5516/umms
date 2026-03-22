const express = require('express');
const router = express.Router();
const { getCities, planJourney, saveJourney, getMyJourneys, getJourneyById } = require('../controllers/journeyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/cities', protect, getCities);
router.post('/plan', protect, planJourney);
router.get('/', protect, getMyJourneys);
router.post('/', protect, saveJourney);
router.get('/:id', protect, getJourneyById);

module.exports = router;
