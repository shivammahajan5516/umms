const express = require('express');
const router = express.Router();
const { makePayment, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, makePayment);
router.get('/', protect, getMyPayments);

module.exports = router;
