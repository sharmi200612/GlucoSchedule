const express = require('express');
const router = express.Router();
const { addReading, getReadings, deleteReading } = require('../controllers/glucoseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getReadings).post(protect, addReading);
router.delete('/:id', protect, deleteReading);

module.exports = router;
