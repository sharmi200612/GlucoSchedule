const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// TODO: Implement admin endpoints
router.get('/', protect, (req, res) => {
  res.json({ message: 'admin route working' });
});

module.exports = router;
