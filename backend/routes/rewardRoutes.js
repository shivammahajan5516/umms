const express = require('express');
const router = express.Router();
const { getMyRewards, checkPoints } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyRewards);
router.post('/check', protect, checkPoints);

module.exports = router;
