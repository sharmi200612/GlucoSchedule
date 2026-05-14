const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// TODO: Implement report endpoints
router.get('/', protect, (req, res) => {
  res.json({ message: 'report route working' });
});

module.exports = router;
