const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
